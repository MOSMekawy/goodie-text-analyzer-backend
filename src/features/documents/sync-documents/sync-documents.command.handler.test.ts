import { Test, TestingModule } from '@nestjs/testing';
import { SyncDocumentsCommandHandler } from './sync-documents.command.handler';
import { SyncDocumentsCommand } from './sync-documents.command';
import { ApplicationResult } from '../../../shared/application/application-result';
import { ProcessDocumentsCommand } from '../process-documents/process-documents.command';

describe('SyncDocumentsCommandHandler', () => {
  let handler: SyncDocumentsCommandHandler;
  let postServiceMock: any;
  let messageBusMock: any;
  let dbMock: any;

  beforeEach(async () => {
    // Create mocks for dependencies
    postServiceMock = {
      getTopPostIds: jest.fn(),
    };

    messageBusMock = {
      publish: jest.fn(),
    };

    dbMock = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncDocumentsCommandHandler,
        { provide: 'IPostService', useValue: postServiceMock },
        { provide: 'IMessageBus', useValue: messageBusMock },
        { provide: 'DB_CONTEXT', useValue: dbMock },
      ],
    }).compile();

    handler = module.get<SyncDocumentsCommandHandler>(
      SyncDocumentsCommandHandler,
    );
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should return service unavailable when post service fails', async () => {
    // Arrange
    postServiceMock.getTopPostIds.mockResolvedValue({
      success: false,
      error: 'Service unavailable',
    });

    // Act
    const result = await handler.execute(new SyncDocumentsCommand());

    // Assert
    expect(result).toBeInstanceOf(ApplicationResult);
    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Service unavailable');
    expect(postServiceMock.getTopPostIds).toHaveBeenCalledTimes(1);
    expect(messageBusMock.publish).not.toHaveBeenCalled();
  });

  it('should process new documents when post service returns ids', async () => {
    // Arrange
    const fetchedIds = [1, 2, 3, 4, 5];
    const existingIds = [1, 3];

    postServiceMock.getTopPostIds.mockResolvedValue({
      success: true,
      data: fetchedIds,
    });

    dbMock.where.mockResolvedValue(
      existingIds.map((id) => ({ externalId: id })),
    );

    // Act
    const result = await handler.execute(new SyncDocumentsCommand());

    // Assert
    expect(result).toBeInstanceOf(ApplicationResult);
    expect(result.isSuccess).toBe(true);
    expect(postServiceMock.getTopPostIds).toHaveBeenCalledTimes(1);

    // Verify database query was called correctly
    expect(dbMock.select).toHaveBeenCalled();
    expect(dbMock.from).toHaveBeenCalled();
    expect(dbMock.where).toHaveBeenCalled();

    // Verify message bus published with correct new IDs (2, 4, 5)
    expect(messageBusMock.publish).toHaveBeenCalledTimes(1);
    expect(messageBusMock.publish).toHaveBeenCalledWith(
      expect.any(ProcessDocumentsCommand),
    );

    const publishedCommand = messageBusMock.publish.mock.calls[0][0];
    expect(publishedCommand).toBeInstanceOf(ProcessDocumentsCommand);
    expect(publishedCommand.sourceId).toBe(0);
    expect(publishedCommand.ids).toEqual(expect.arrayContaining([2, 4, 5]));
    expect(publishedCommand.ids.length).toBe(3);
  });

  it('should not publish command when all documents already exist', async () => {
    // Arrange
    const fetchedIds = [1, 2, 3];

    postServiceMock.getTopPostIds.mockResolvedValue({
      success: true,
      data: fetchedIds,
    });

    dbMock.where.mockResolvedValue(
      fetchedIds.map((id) => ({ externalId: id })),
    );

    // Act
    const result = await handler.execute(new SyncDocumentsCommand());

    // Assert
    expect(result).toBeInstanceOf(ApplicationResult);
    expect(result.isSuccess).toBe(true);
    expect(postServiceMock.getTopPostIds).toHaveBeenCalledTimes(1);

    // Verify database query was called correctly
    expect(dbMock.select).toHaveBeenCalled();
    expect(dbMock.from).toHaveBeenCalled();
    expect(dbMock.where).toHaveBeenCalled();

    // Verify message bus was not called since there are no new documents
    expect(messageBusMock.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        ids: [],
      }),
    );
  });
});

import { Document } from '../../domain/entities/document.entity';
import { Title, Content } from '../../domain/value-objects';
import { documents } from '../schemas/documents';

export class DocumentMapper {
  /**
   * Maps a database record to a domain entity
   */
  public static toDomain(record: typeof documents.$inferSelect): Document {
    // We're using the internal constructor here which isn't ideal,
    // but we'll create a reconstruction method in the domain entity later
    const titleResult = Title.create(record.title);
    const contentResult = Content.create(record.content);

    if (titleResult.isFailure || contentResult.isFailure) {
      throw new Error(
        'Failed to reconstruct Document entity from database record',
      );
    }

    const document = new Document(
      record.title,
      record.content,
      record.sourceId,
      record.externalId,
    );


    // Set additional properties that aren't part of the constructor
    Object.assign(document, {
      id: record.id,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });

    return document;
  }

  /**
   * Maps a domain entity to a database record
   */
  public static toPersistence(entity: Document): typeof documents.$inferInsert {
    return Object.freeze({
      title: entity.title,
      content: entity.content,
      sourceId: entity.sourceId,
      externalId: entity.externalId,
    });
  }
}

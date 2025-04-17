import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { CommandBus } from '@nestjs/cqrs';
import { COMMAND_HANDLER_METADATA } from '@nestjs/cqrs/dist/decorators/constants';

@Injectable()
export class RabbitMQWorker implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQWorker.name);
  private commandRegistry = new Map<string, any>();

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly commandBus: CommandBus,
  ) {}

  onModuleInit() {
    const providers = this.discoveryService.getProviders();
    providers.forEach((wrapper) => {
      const { instance, metatype } = wrapper;
      if (!instance || !metatype) return;

      // Get metadata that the @CommandHandler decorator added.
      const commandType: any = this.reflector.get<any>(
        COMMAND_HANDLER_METADATA,
        metatype,
      );
      if (commandType) {
        // Use the command class name as the key
        this.commandRegistry.set(commandType.name, commandType);
      }
    });
  }

  @RabbitSubscribe({
    exchange: '', // Default exchange
    routingKey: 'command_processor',
    queue: 'command_processor',
  })
  public async handleMessage(message: any) {
    const { commandName, payload } = message;
    const commandType = this.commandRegistry.get(commandName);
    if (!commandType) {
      throw new Error(`Command ${commandName} not found.`);
    }

    const command = Object.create(commandType.prototype);
    Object.assign(command, payload);

    try {
      const result = await this.commandBus.execute(command);
      if (result.isFailure) {
        this.logger.error(`Command ${commandName} failed: ${result.error}`);
        return new Nack(false);
      }
    } catch (error) {
      this.logger.error(
        `Error processing command ${commandName}: ${error.message}`,
      );

      return new Nack(false);
    }
  }
}

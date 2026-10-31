// server/connectors/registry.ts - Connector Registry
import type { ChannelConnector, ProviderType, ChannelType } from "./types.js";
import { MetaCloudApiConnector } from "./adapters/MetaCloudApiConnector.js";
import { WhatsAppWebConnector } from "./adapters/WhatsAppWebConnector.js";
import { TelegramBotConnector } from "./adapters/TelegramBotConnector.js";

export class ConnectorRegistry {
  private static instance: ConnectorRegistry | null = null;
  private connectors: Map<ProviderType, ChannelConnector> = new Map();

  private constructor() {
    this.register(new MetaCloudApiConnector());
    this.register(new WhatsAppWebConnector());
    this.register(new TelegramBotConnector());
  }

  public static getInstance(): ConnectorRegistry {
    if (!ConnectorRegistry.instance) {
      ConnectorRegistry.instance = new ConnectorRegistry();
    }
    return ConnectorRegistry.instance;
  }

  public register(connector: ChannelConnector): void {
    this.connectors.set(connector.provider, connector);
  }

  public get(provider: ProviderType): ChannelConnector | undefined {
    return this.connectors.get(provider);
  }

  public getByChannel(channel: ChannelType): ChannelConnector[] {
    return Array.from(this.connectors.values()).filter((c) => c.channel === channel);
  }

  public listProviders(): ProviderType[] {
    return Array.from(this.connectors.keys());
  }
}

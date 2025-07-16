// graphql.ts
// eslint-disable-next-line max-classes-per-file
import { DocumentNode, OperationDefinitionNode, parse, print } from 'graphql';
import { request as gqlRequest, Variables, RequestDocument } from 'graphql-request';
import serviceHeaderBuilder from './serviceHeaderBuilder';

export const GRAPHQL_ENDPOINT = 'https://wallet.qubic.app/services/graphql-public';

export interface GqlConfig {
  apiKey: string;
  apiSecret: string;
  apiUri: string;
}

export interface InitGqlConfig extends Partial<Pick<GqlConfig, 'apiUri'>> {
  apiKey: string;
  apiSecret: string;
}

function extractOperationName(doc: DocumentNode): string | undefined {
  const def = doc.definitions.find(d => d.kind === 'OperationDefinition') as OperationDefinitionNode | undefined;
  return def?.name?.value;
}

export class GraphQLClient {
  private static instance: GraphQLClient | null = null;
  private config!: GqlConfig;

  // eslint-disable-next-line no-useless-constructor, @typescript-eslint/no-empty-function
  private constructor() {}

  public static init(cfg: InitGqlConfig): void {
    if (!cfg.apiKey || !cfg.apiSecret) {
      throw new Error('Missing required configuration parameters: apiKey and apiSecret.');
    }

    const full: GqlConfig = {
      apiKey: cfg.apiKey,
      apiSecret: cfg.apiSecret,
      apiUri: cfg.apiUri || GRAPHQL_ENDPOINT,
    };

    if (!this.instance) {
      this.instance = new GraphQLClient();
      this.instance.config = full;
      return;
    }

    const cur = this.instance.config;
    if (cur.apiKey === full.apiKey && cur.apiSecret === full.apiSecret && cur.apiUri === full.apiUri) {
      return;
    }

    throw new Error('GraphQLClient already initialized with a different configuration.');
  }

  public static _resetInstanceForTesting(): void {
    this.instance = null;
  }

  public static getInstance(): GraphQLClient {
    if (!this.instance) {
      throw new Error('GraphQLClient not initialized. Please call initNetworkInfoFetcher() or init() first.');
    }
    return this.instance;
  }

  public async request<TVars extends Variables, TResult>(input: {
    query: string;
    variables?: TVars;
    isPublic?: boolean;
  }): Promise<TResult> {
    const { query, variables } = input;
    const { apiKey, apiSecret, apiUri } = this.config;

    const { query: gql, operationName } = GraphQLClient.resolveRequestDocument(query);
    if (!operationName) {
      throw new Error('Invalid GraphQL query or operation name not found');
    }
    const body = JSON.stringify({ query: gql, variables, operationName });
    const headers = serviceHeaderBuilder({
      serviceUri: apiUri,
      httpMethod: 'POST',
      apiKey,
      apiSecret,
      body,
    });

    return gqlRequest({
      url: apiUri,
      document: gql,
      variables,
      requestHeaders: headers,
    });
  }

  public static resolveRequestDocument(doc: RequestDocument): { query: string; operationName?: string } {
    if (typeof doc === 'string') {
      try {
        const parsed = parse(doc);
        return { query: doc, operationName: extractOperationName(parsed) };
      } catch {
        return { query: doc };
      }
    }
    return { query: print(doc), operationName: extractOperationName(doc as DocumentNode) };
  }
}

export function initNetworkInfoFetcher(cfg: InitGqlConfig): void {
  return GraphQLClient.init(cfg);
}

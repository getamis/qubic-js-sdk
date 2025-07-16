// graphql.ts
// eslint-disable-next-line max-classes-per-file
import { DocumentNode, OperationDefinitionNode, parse, print } from 'graphql';
import { request as gqlRequest, Variables, RequestDocument } from 'graphql-request';
import serviceHeaderBuilder from './serviceHeaderBuilder';
import { GRAPHQL_ENDPOINT } from '../types';

export interface GqlConfig {
  apiKey: string;
  apiSecret: string;
  apiUri: string;
}

export interface InitGqlConfig {
  apiKey: GqlConfig['apiKey'];
  apiSecret: GqlConfig['apiSecret'];
  apiUri?: GqlConfig['apiUri'];
}

interface RequestGraphqlInput<TVariables> {
  query: string;
  variables?: TVariables;
}

function extractOperationName(document: DocumentNode): string | undefined {
  const operationDefinitions = document.definitions.filter(
    (def): def is OperationDefinitionNode => def.kind === 'OperationDefinition',
  );

  return operationDefinitions.length === 1 ? operationDefinitions[0]?.name?.value : undefined;
}

export function resolveRequestDocument(document: RequestDocument): { query: string; operationName?: string } {
  if (typeof document === 'string') {
    let operationName;

    try {
      const parsedDocument = parse(document);
      operationName = extractOperationName(parsedDocument);
    } catch (err) {
      // Failed parsing the document, the operationName will be undefined
    }

    return { query: document, operationName };
  }

  const operationName = extractOperationName(document);

  return { query: print(document), operationName };
}

export class GraphQLClient {
  private static instance: GraphQLClient | null = null;
  private config: GqlConfig | undefined;

  public static getInstance(): GraphQLClient {
    if (!GraphQLClient.instance) {
      throw new Error('GraphQLClient not initialized. Please call initNetworkInfoFetcher() or init() first.');
    }
    return GraphQLClient.instance;
  }

  // Private constructor to enforce singleton pattern, avoid being constructed directly
  // eslint-disable-next-line no-useless-constructor, @typescript-eslint/no-empty-function
  private constructor() {}

  public static init(inputConfig: InitGqlConfig): void {
    if (!inputConfig.apiKey || !inputConfig.apiSecret) {
      throw new Error('Missing required configuration parameters');
    }

    const full: GqlConfig = {
      apiKey: inputConfig.apiKey,
      apiSecret: inputConfig.apiSecret,
      apiUri: inputConfig.apiUri || GRAPHQL_ENDPOINT,
    };

    // if no instance, initialize instance and end
    if (!this.instance) {
      this.instance = new GraphQLClient();
      this.instance.config = full;
      return;
    }

    // if instance exists, check if config matches
    const currentConfig = this.instance.config;
    if (!currentConfig) {
      throw new Error('should never happen: GraphQLClient instance exists but config is undefined');
    }

    if (
      currentConfig.apiKey !== full.apiKey ||
      currentConfig.apiSecret !== full.apiSecret ||
      currentConfig.apiUri !== full.apiUri
    ) {
      throw new Error('GraphQLClient already initialized with a different configuration.');
    }
  }

  public static _resetInstanceForTesting(): void {
    this.instance = null;
  }

  public async request<TVariables extends Variables, TResult>(
    input: RequestGraphqlInput<TVariables>,
  ): Promise<TResult> {
    const { query, variables } = input;
    if (!this.config) {
      throw new Error('GraphQLClient not initialized');
    }
    const { apiKey, apiSecret, apiUri } = this.config;

    const { operationName, query: graphQLQuery } = resolveRequestDocument(query);
    const body = operationName && query ? JSON.stringify({ query: graphQLQuery, variables, operationName }) : undefined;

    if (!body) {
      throw new Error('Invalid GraphQL query or operation name not found');
    }

    const headers = serviceHeaderBuilder({
      serviceUri: apiUri,
      httpMethod: 'POST',
      apiKey,
      apiSecret,
      body,
    });

    return gqlRequest({
      url: apiUri,
      document: query,
      variables,
      requestHeaders: headers,
    });
  }
}

export function initNetworkInfoFetcher(config: InitGqlConfig): void {
  return GraphQLClient.init(config);
}

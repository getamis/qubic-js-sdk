import { DocumentNode, OperationDefinitionNode, parse, print } from 'graphql';
import { request, RequestDocument, Variables } from 'graphql-request';
import serviceHeaderBuilder from './serviceHeaderBuilder';

interface GqlConfig {
  apiKey: string;
  apiSecret: string;
  apiUri: string;
}

interface RequestGraphqlInput<TVariables> {
  query: string;
  variables?: TVariables;
  isPublic?: boolean;
}

function extractOperationName(document: DocumentNode): string | undefined {
  const operationDefinitions = document.definitions.filter(
    (def): def is OperationDefinitionNode => def.kind === 'OperationDefinition'
  );

  return operationDefinitions.length === 1
    ? operationDefinitions[0]?.name?.value
    : undefined;
}

export class GraphQLClient {
  private static instance: GraphQLClient;
  private config: GqlConfig | undefined;

  public static getInstance(): GraphQLClient {
    if (!GraphQLClient.instance) {
      GraphQLClient.instance = new GraphQLClient();
    }
    return GraphQLClient.instance;
  }

  public init(config: GqlConfig): void {
    if (this.config) {
      throw new Error('GraphQLClient already initialized');
    }

    if (!config.apiKey || !config.apiSecret || !config.apiUri) {
      throw new Error('Missing required configuration parameters');
    }

    this.config = { ...config };
  }

  public async request<TVariables extends Variables, TResult>(
    input: RequestGraphqlInput<TVariables>
  ): Promise<TResult> {
    const { query, variables } = input;
    if (!this.config) {
      throw new Error('GraphQLClient not initialized');
    }

    const { apiKey, apiSecret, apiUri } = this.config;

    const { operationName, query: graphQLQuery } = GraphQLClient.resolveRequestDocument(query);
    const body = operationName && query
      ? JSON.stringify({ query: graphQLQuery, variables, operationName })
      : undefined;

    const headers = serviceHeaderBuilder({
      serviceUri: apiUri,
      httpMethod: 'POST',
      apiKey,
      apiSecret,
      body,
    });

    return request({
      url: apiUri,
      document: query,
      variables,
      requestHeaders: headers,
    });
  }

  static resolveRequestDocument(
    document: RequestDocument
  ): { query: string; operationName?: string } {
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
}

export function initGraphqlClient(config: GqlConfig): void {
  GraphQLClient.getInstance().init(config);
}

import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as bedrock from 'aws-cdk-lib/aws-bedrock';
import * as oss from 'aws-cdk-lib/aws-opensearchserverless';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3Deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as iam from 'aws-cdk-lib/aws-iam';

const UUID = '339C5FED-A1B5-43B6-B40A-5E8E59E5734D';

// 以下が現状 Embedding model としてサポートされているモデル ID
// Dimension は最終的に Custom resource の props として渡すが
// 勝手に型が変換されてしまう Issue があるため、number ではなく string にしておく
// https://github.com/aws-cloudformation/cloudformation-coverage-roadmap/issues/1037
const MODEL_VECTOR_MAPPING: { [key: string]: string } = {
  'amazon.titan-embed-text-v1': '1536',
  'amazon.titan-embed-text-v2:0': '1024',
  'cohere.embed-multilingual-v3': '1024',
  'cohere.embed-english-v3': '1024',
};

// parsingConfiguration で PDF ファイルの中に埋め込まれている画像やグラフや表を読み取る機能がある。
// 読み取る際のプロンプトは任意のものが定義できる。以下に const として定義する。利用環境によってプロンプトを変更することで、より高い精度を期待できる。
// https://docs.aws.amazon.com/bedrock/latest/userguide/kb-chunking-parsing.html#kb-advanced-parsing
const PARSING_PROMPT = `문서에 포함된 이미지나 그래프, 표 등의 Image 콘텐츠에서 텍스트를 복사하여 코드 블록이 아닌 Markdown 구문으로 출력합니다. 다음 단계를 따르세요:

1. 제공된 페이지를 주의 깊게 살펴봅니다.

2. 페이지에 존재하는 모든 요소를 식별합니다. 여기에는 제목, 본문, 각주, 표, 시각화, 캡션, 페이지 번호 등이 포함됩니다.

3. 마크다운 구문 형식을 사용하여 출력한다. 
- 표제: 제목은 #, 섹션은 ##, 하위 섹션은 ### 등으로 표시합니다.
- 목록: 글머리 기호에는 * 또는 -, 번호가 매겨진 목록에는 1.2.3.
- 반복은 피해야 합니다.

4. 요소가 Visualization인 경우:
- 자연어로 자세한 설명을 제공해야 합니다.
- 설명을 제공한 후 시각화 내의 텍스트를 그대로 옮겨서는 안 됩니다.

5. 요소가 표인 경우:
- Markdown 표를 만들고 모든 행이 동일한 열 수를 갖도록 합니다.
- 셀의 배열을 가능한 한 충실하게 유지하십시오.
- 표를 여러 개의 표로 분할하지 마십시오.
- 결합된 셀이 여러 행과 열에 걸쳐 있는 경우, 텍스트를 왼쪽 상단 셀에 배치하고 다른 셀에는 ' '를 출력합니다.
- 열을 구분할 때는 |를 사용하고 헤더 행을 구분할 때는 |-|-|를 사용해야 합니다.
- 한 셀에 여러 항목이 있는 경우 별도의 행에 나열하십시오.
- 표에 서브 헤더가 있는 경우, 서브 헤더를 헤더와 별도의 행으로 분리합니다.

6. 요소가 단락인 경우:
- 각 텍스트 요소를 표시된 대로 정확하게 옮겨 적습니다.

7. 요소가 머리글, 바닥글, 각주, 페이지 번호인 경우:
- 각 텍스트 요소를 표시된 대로 정확하게 옮겨야 합니다.

출력 예시:

Y축에 '매출액($백만)', X축에 '연도'로 표시된 연간 매출액을 나타내는 막대 그래프. 그래프에는 2018년($12M), 2019년($18M), 2020년($8M), 2021년($22M)의 막대가 있다.
그림 3: 이 그래프는 연간 매출액을 백만 달러 단위로 표시한 것으로, 2020년에는 코로나19의 영향으로 크게 감소했다.

연례 보고서
재무 하이라이트
매출: $40M
이익: $12M
주당순이익: $1.25
| | 12월 31일 마감 연도 | | | | 2021 2022

2021년 2022년
현금 흐름:		
영업활동 $ 46,327 $ 46,752 $ 46,752
투자 활동 (58,154) (37,601)
재무활동 6,291 9,718`;

const EMBEDDING_MODELS = Object.keys(MODEL_VECTOR_MAPPING);

interface OpenSearchServerlessIndexProps {
  collectionId: string;
  vectorIndexName: string;
  vectorField: string;
  metadataField: string;
  textField: string;
  vectorDimension: string;
}

class OpenSearchServerlessIndex extends Construct {
  public readonly customResourceHandler: lambda.IFunction;
  public readonly customResource: cdk.CustomResource;

  constructor(
    scope: Construct,
    id: string,
    props: OpenSearchServerlessIndexProps
  ) {
    super(scope, id);

    const customResourceHandler = new lambda.SingletonFunction(
      this,
      'OpenSearchServerlessIndex',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('custom-resources'),
        handler: 'oss-index.handler',
        uuid: UUID,
        lambdaPurpose: 'OpenSearchServerlessIndex',
        timeout: cdk.Duration.minutes(15),
      }
    );

    const customResource = new cdk.CustomResource(this, 'CustomResource', {
      serviceToken: customResourceHandler.functionArn,
      resourceType: 'Custom::OssIndex',
      properties: props,
    });

    this.customResourceHandler = customResourceHandler;
    this.customResource = customResource;
  }
}

interface RagKnowledgeBaseStackProps extends StackProps {
  collectionName?: string;
  vectorIndexName?: string;
  vectorField?: string;
  metadataField?: string;
  textField?: string;
}

export class RagKnowledgeBaseStack extends Stack {
  public readonly knowledgeBaseId: string;
  public readonly dataSourceBucketName: string;

  constructor(scope: Construct, id: string, props: RagKnowledgeBaseStackProps) {
    super(scope, id, props);

    const embeddingModelId: string | null | undefined =
      this.node.tryGetContext('embeddingModelId')!;

    if (typeof embeddingModelId !== 'string') {
      throw new Error(
        'Knowledge Base RAG が有効になっていますが、embeddingModelId が指定されていません'
      );
    }

    if (!EMBEDDING_MODELS.includes(embeddingModelId)) {
      throw new Error(
        `embeddingModelId 가 잘못된 값입니다. (유효한 embeddingModelId ${EMBEDDING_MODELS})`
      );
    }

    const collectionName = props.collectionName ?? 'generative-ai-use-cases-jp';
    const vectorIndexName =
      props.vectorIndexName ?? 'bedrock-knowledge-base-default';
    const vectorField =
      props.vectorField ?? 'bedrock-knowledge-base-default-vector';
    const textField = props.textField ?? 'AMAZON_BEDROCK_TEXT_CHUNK';
    const metadataField = props.metadataField ?? 'AMAZON_BEDROCK_METADATA';

    const knowledgeBaseRole = new iam.Role(this, 'KnowledgeBaseRole', {
      assumedBy: new iam.ServicePrincipal('bedrock.amazonaws.com'),
    });

    const standbyReplicas = this.node.tryGetContext(
      'ragKnowledgeBaseStandbyReplicas'
    );

    const ragKnowledgeBaseAdvancedParsing = this.node.tryGetContext(
      'ragKnowledgeBaseAdvancedParsing'
    )!;

    const ragKnowledgeBaseAdvancedParsingModelId: string | null | undefined =
      this.node.tryGetContext('ragKnowledgeBaseAdvancedParsingModelId')!;

    if (
      ragKnowledgeBaseAdvancedParsing &&
      typeof ragKnowledgeBaseAdvancedParsingModelId !== 'string'
    ) {
      throw new Error(
        'Knowledge Base RAG의 Advanced Parsing이 활성화되어 있지만, ragKnowledgeBaseAdvancedParsingModelId가 지정되지 않았거나 문자열이 아닙니다.'
      );
    }

    const collection = new oss.CfnCollection(this, 'Collection', {
      name: collectionName,
      description: 'GenU Collection',
      type: 'VECTORSEARCH',
      standbyReplicas: standbyReplicas ? 'ENABLED' : 'DISABLED',
    });

    const ossIndex = new OpenSearchServerlessIndex(this, 'OssIndex', {
      collectionId: collection.ref,
      vectorIndexName,
      vectorField,
      textField,
      metadataField,
      vectorDimension: MODEL_VECTOR_MAPPING[embeddingModelId],
    });

    ossIndex.customResourceHandler.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: [cdk.Token.asString(collection.getAtt('Arn'))],
        actions: ['aoss:APIAccessAll'],
      })
    );

    const accessPolicy = new oss.CfnAccessPolicy(this, 'AccessPolicy', {
      name: collectionName,
      policy: JSON.stringify([
        {
          Rules: [
            {
              Resource: [`collection/${collectionName}`],
              Permission: [
                'aoss:DescribeCollectionItems',
                'aoss:CreateCollectionItems',
                'aoss:UpdateCollectionItems',
              ],
              ResourceType: 'collection',
            },
            {
              Resource: [`index/${collectionName}/*`],
              Permission: [
                'aoss:UpdateIndex',
                'aoss:DescribeIndex',
                'aoss:ReadDocument',
                'aoss:WriteDocument',
                'aoss:CreateIndex',
                'aoss:DeleteIndex',
              ],
              ResourceType: 'index',
            },
          ],
          Principal: [
            knowledgeBaseRole.roleArn,
            ossIndex.customResourceHandler.role?.roleArn,
          ],
          Description: '',
        },
      ]),
      type: 'data',
    });

    const networkPolicy = new oss.CfnSecurityPolicy(this, 'NetworkPolicy', {
      name: collectionName,
      policy: JSON.stringify([
        {
          Rules: [
            {
              Resource: [`collection/${collectionName}`],
              ResourceType: 'collection',
            },
            {
              Resource: [`collection/${collectionName}`],
              ResourceType: 'dashboard',
            },
          ],
          AllowFromPublic: true,
        },
      ]),
      type: 'network',
    });

    const encryptionPolicy = new oss.CfnSecurityPolicy(
      this,
      'EncryptionPolicy',
      {
        name: collectionName,
        policy: JSON.stringify({
          Rules: [
            {
              Resource: [`collection/${collectionName}`],
              ResourceType: 'collection',
            },
          ],
          AWSOwnedKey: true,
        }),
        type: 'encryption',
      }
    );

    collection.node.addDependency(accessPolicy);
    collection.node.addDependency(networkPolicy);
    collection.node.addDependency(encryptionPolicy);

    const accessLogsBucket = new s3.Bucket(this, 'DataSourceAccessLogsBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
      objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
      enforceSSL: true,
    });

    const dataSourceBucket = new s3.Bucket(this, 'DataSourceBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
      serverAccessLogsBucket: accessLogsBucket,
      serverAccessLogsPrefix: 'AccessLogs/',
      enforceSSL: true,
    });

    knowledgeBaseRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: ['*'],
        actions: ['bedrock:InvokeModel'],
      })
    );

    knowledgeBaseRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: [cdk.Token.asString(collection.getAtt('Arn'))],
        actions: ['aoss:APIAccessAll'],
      })
    );

    knowledgeBaseRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: [`arn:aws:s3:::${dataSourceBucket.bucketName}`],
        actions: ['s3:ListBucket'],
      })
    );

    knowledgeBaseRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: [`arn:aws:s3:::${dataSourceBucket.bucketName}/*`],
        actions: ['s3:GetObject'],
      })
    );

    const knowledgeBase = new bedrock.CfnKnowledgeBase(this, 'KnowledgeBase', {
      name: collectionName,
      roleArn: knowledgeBaseRole.roleArn,
      knowledgeBaseConfiguration: {
        type: 'VECTOR',
        vectorKnowledgeBaseConfiguration: {
          embeddingModelArn: `arn:aws:bedrock:${this.region}::foundation-model/${embeddingModelId}`,
        },
      },
      storageConfiguration: {
        type: 'OPENSEARCH_SERVERLESS',
        opensearchServerlessConfiguration: {
          collectionArn: cdk.Token.asString(collection.getAtt('Arn')),
          fieldMapping: {
            metadataField,
            textField,
            vectorField,
          },
          vectorIndexName,
        },
      },
    });

    new bedrock.CfnDataSource(this, 'DataSource', {
      dataSourceConfiguration: {
        s3Configuration: {
          bucketArn: `arn:aws:s3:::${dataSourceBucket.bucketName}`,
          inclusionPrefixes: ['docs/'],
        },
        type: 'S3',
      },
      vectorIngestionConfiguration: {
        ...(ragKnowledgeBaseAdvancedParsing
          ? {
              // Advanced Parsing を有効化する場合のみ、parsingConfiguration を構成する
              parsingConfiguration: {
                parsingStrategy: 'BEDROCK_FOUNDATION_MODEL',
                bedrockFoundationModelConfiguration: {
                  modelArn: `arn:aws:bedrock:${this.region}::foundation-model/${ragKnowledgeBaseAdvancedParsingModelId}`,
                  parsingPrompt: {
                    parsingPromptText: PARSING_PROMPT,
                  },
                },
              },
            }
          : {}),
        // チャンク戦略を変更したい場合は、以下のコメントアウトを外して、各種パラメータを調整することで、環境に合わせた環境構築が可能です。
        // 以下の 4 種類のチャンク戦略が選択可能です。
        // - デフォルト (何も指定しない)
        // - セマンティックチャンク
        // - 階層チャンク
        // - 標準チャンク
        // 詳細は以下の Document を参照ください。
        // https://docs.aws.amazon.com/bedrock/latest/userguide/kb-chunking-parsing.html
        // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_bedrock.CfnDataSource.ChunkingConfigurationProperty.html
        //
        // セマンティックチャンク
        // chunkingConfiguration: {
        //   chunkingStrategy: 'SEMANTIC',
        //   semanticChunkingConfiguration: {
        //     maxTokens: 300,
        //     bufferSize: 0,
        //     breakpointPercentileThreshold: 95,
        //   },
        // },
        //
        // 階層チャンク
        // chunkingConfiguration: {
        //   chunkingStrategy: 'HIERARCHICAL',
        //   hierarchicalChunkingConfiguration: {
        //     levelConfigurations: [
        //       {
        //         maxTokens: 1500, // 親チャンクの Max Token サイズ
        //       },
        //       {
        //         maxTokens: 300, // 子チャンクの Max Token サイズ
        //       },
        //     ],
        //     overlapTokens: 60,
        //   },
        // },
        //
        // 標準チャンク
        // chunkingConfiguration: {
        //   chunkingStrategy: 'FIXED_SIZE',
        //   fixedSizeChunkingConfiguration: {
        //     maxTokens: 300,
        //     overlapPercentage: 10,
        //   },
        // },
      },
      knowledgeBaseId: knowledgeBase.ref,
      name: 's3-data-source',
    });

    knowledgeBase.addDependency(collection);
    knowledgeBase.node.addDependency(ossIndex.customResource);

    new s3Deploy.BucketDeployment(this, 'DeployDocs', {
      sources: [s3Deploy.Source.asset('./rag-docs')],
      destinationBucket: dataSourceBucket,
      // 以前の設定で同 Bucket にアクセスログが残っている可能性があるため、この設定は残す
      exclude: ['AccessLogs/*', 'logs*'],
    });

    this.knowledgeBaseId = knowledgeBase.ref;
    this.dataSourceBucketName = dataSourceBucket.bucketName;
  }
}

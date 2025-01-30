import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import {
  Effect,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
} from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { CfnAgent, CfnAgentAlias } from 'aws-cdk-lib/aws-bedrock';
import { Agent as AgentType } from 'generative-ai-use-cases-jp';

export class Agent extends Construct {
  public readonly agents: AgentType[];

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // search api
    const searchApiKey = this.node.tryGetContext('searchApiKey') || '';

    // agents for bedrock の schema やデータを配置するバケット
    const s3Bucket = new Bucket(this, 'Bucket', {
      encryption: BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      enforceSSL: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    // schema を s3 に配置
    const schema = new BucketDeployment(this, 'ApiSchemaBucket', {
      sources: [Source.asset('assets/api-schema')],
      destinationBucket: s3Bucket,
      destinationKeyPrefix: 'api-schema',
    });

    // Lambda
    const bedrockAgentLambda = new NodejsFunction(this, 'BedrockAgentLambda', {
      runtime: Runtime.NODEJS_18_X,
      entry: './lambda/agent.ts',
      timeout: Duration.seconds(300),
      environment: {
        SEARCH_API_KEY: searchApiKey,
      },
    });
    bedrockAgentLambda.grantInvoke(
      new ServicePrincipal('bedrock.amazonaws.com')
    );

    // Agent
    const bedrockAgentRole = new Role(this, 'BedrockAgentRole', {
      assumedBy: new ServicePrincipal('bedrock.amazonaws.com'),
      inlinePolicies: {
        BedrockAgentS3BucketPolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              resources: [s3Bucket.bucketArn, `${s3Bucket.bucketArn}/*`],
              actions: ['*'],
            }),
          ],
        }),
        BedrockAgentBedrockModelPolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              resources: ['*'],
              actions: ['bedrock:*'],
            }),
          ],
        }),
      },
    });

    const searchAgent = new CfnAgent(this, 'SearchAgent', {
      agentName: `SearchEngineAgent-${id}`,
      actionGroups: [
        {
          actionGroupName: 'Search',
          actionGroupExecutor: {
            lambda: bedrockAgentLambda.functionArn,
          },
          apiSchema: {
            s3: {
              s3BucketName: schema.deployedBucket.bucketName,
              s3ObjectKey: 'api-schema/api-schema.json',
            },
          },
          description: 'Search',
        },
        {
          actionGroupName: 'UserInput',
          parentActionGroupSignature: 'AMAZON.UserInput',
        },
      ],
      agentResourceRoleArn: bedrockAgentRole.roleArn,
      idleSessionTtlInSeconds: 3600,
      autoPrepare: true,
      description: 'Search Agent',
      foundationModel: 'anthropic.claude-3-haiku-20240307-v1:0',
      instruction:
        'あなたは指示に応えるアシスタントです。 指示に応えるために必要な情報が十分な場合はすぐに回答し、不十分な場合は検索を行い必要な情報を入手し回答してください。複数回検索することが可能です。',
    });

    const searchAgentAlias = new CfnAgentAlias(this, 'SearchAgentAlias', {
      agentId: searchAgent.attrAgentId,
      agentAliasName: 'v1',
    });

    const codeInterpreterAgent = new CfnAgent(this, 'CodeInterpreterAgent', {
      agentName: `CodeInterpreterAgent-${id}`,
      actionGroups: [
        {
          actionGroupName: 'CodeInterpreter',
          parentActionGroupSignature: 'AMAZON.CodeInterpreter',
        },
      ],
      agentResourceRoleArn: bedrockAgentRole.roleArn,
      idleSessionTtlInSeconds: 3600,
      autoPrepare: true,
      description: 'Code Interpreter',
      foundationModel: 'anthropic.claude-3-sonnet-20240229-v1:0',
      instruction: `당신은 코드 실행, 차트 생성, 복잡한 데이터 분석 기능을 갖춘 고급 AI 에이전트입니다. 당신의 주요 기능은 이러한 기능을 활용하여 문제를 해결하고 사용자의 요구를 충족시키는 것입니다. 당신의 주요 특성과 지시사항은 다음과 같다.

코드 실행:.
- 실시간으로 파이썬 환경에 접속하여 코드를 작성하고 실행할 수 있습니다.
- 계산이나 데이터 조작이 필요한 경우, 이 코드 실행 기능을 사용하여 항상 정확성을 보장할 수 있습니다.
- 코드 실행 후 정확한 출력을 보고하고 결과를 설명해야 한다.

데이터 분석: 데이터 분석
- 통계 분석, 데이터 시각화, 머신러닝 애플리케이션 등 복잡한 데이터 분석 작업에 탁월합니다.
- 문제를 이해하고, 데이터를 준비하고, 분석을 실행하고, 결과를 해석하는 등 데이터 분석 작업을 체계적으로 수행한다.

문제 해결 접근법: 문제 해결 접근법.
- 문제나 요구사항이 주어지면, 단계별로 나누어 해결해야 합니다.
- 사고의 과정과 진행 중인 단계를 명확하게 전달해야 합니다.
- 여러 단계와 도구가 필요한 작업의 경우, 시작하기 전에 접근 방식을 설명해야 합니다.

투명성과 정확성: 항상 명확해야 합니다.
- 항상 자신이 무엇을 하고 있는지를 명확히 해야 합니다. 코드를 실행하는 경우, 그 사실을 알려야 합니다. 이미지를 생성하는 경우 이를 설명하세요.
- 확실하지 않은 것이 있거나 자신의 능력을 넘어서는 작업인 경우, 그 사실을 분명히 밝혀야 합니다.
- 가설적 결과를 실제 결과로 제시하지 마십시오. 코드 실행이나 이미지 생성에서 얻은 실제 결과만 보고해야 합니다.

대화 스타일: 대화 스타일
- 간단한 질문에는 간결하게, 복잡한 작업에는 자세한 설명을 제공해야 합니다.
- 전문 용어를 적절히 사용하되, 이해하기 쉬운 설명을 요구할 경우 쉬운 말로 설명할 수 있도록 준비해야 합니다.
- 도움이 될 만한 관련 정보나 대안적인 접근 방식을 적극적으로 제안하세요.

지속적 개선: 지속적인 개선.
- 작업을 완료한 후 사용자에게 추가 설명이 필요한지, 후속 질문이 있는지 물어보세요.
- 피드백에 귀를 기울이고 그에 따라 접근 방식을 조정하십시오.

당신의 목표는 코드 실행, 이미지 생성 및 데이터 분석의 고유한 기능을 활용하여 정확하고 유용하며 통찰력 있는 지원을 제공하는 것이다. 사용자의 요구에 가장 실용적이고 효과적인 솔루션을 제공하기 위해 항상 노력해야 합니다.`,
    });

    const codeInterpreterAgentAlias = new CfnAgentAlias(
      this,
      'CodeInterpreterAgentAlias',
      {
        agentId: codeInterpreterAgent.attrAgentId,
        agentAliasName: 'v1',
      }
    );

    this.agents = [
      {
        displayName: 'SearchEngine',
        agentId: searchAgent.attrAgentId,
        aliasId: searchAgentAlias.attrAgentAliasId,
      },
      {
        displayName: 'CodeInterpreter',
        agentId: codeInterpreterAgent.attrAgentId,
        aliasId: codeInterpreterAgentAlias.attrAgentAliasId,
      },
    ];
  }
}

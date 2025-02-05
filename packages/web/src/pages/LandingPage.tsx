import React from 'react';
import { useNavigate } from 'react-router-dom';
import CardDemo from '../components/CardDemo';
import Button from '../components/Button';
import {
  PiChatCircleText,
  PiPencil,
  PiNote,
  PiChatsCircle,
  PiPenNib,
  PiTranslate,
  PiGlobe,
  PiImages,
  PiNotebook,
  PiPen,
  PiRobot,
  PiVideoCamera,
  PiFlowArrow,
} from 'react-icons/pi';
import AwsIcon from '../assets/aws.svg?react';
import useInterUseCases from '../hooks/useInterUseCases';
import {
  AgentPageQueryParams,
  ChatPageQueryParams,
  EditorialPageQueryParams,
  GenerateImagePageQueryParams,
  GenerateTextPageQueryParams,
  InterUseCaseParams,
  RagPageQueryParams,
  SummarizePageQueryParams,
  TranslatePageQueryParams,
  WebContentPageQueryParams,
  VideoAnalyzerPageQueryParams,
} from '../@types/navigate';
import queryString from 'query-string';
import { MODELS } from '../hooks/useModel';

const ragEnabled: boolean = import.meta.env.VITE_APP_RAG_ENABLED === 'true';
const ragKnowledgeBaseEnabled: boolean =
  import.meta.env.VITE_APP_RAG_KNOWLEDGE_BASE_ENABLED === 'true';
const agentEnabled: boolean = import.meta.env.VITE_APP_AGENT_ENABLED === 'true';
const { visionEnabled } = MODELS;
const getPromptFlows = () => {
  try {
    return JSON.parse(import.meta.env.VITE_APP_PROMPT_FLOWS);
  } catch (e) {
    return [];
  }
};
const promptFlows = getPromptFlows();
const promptFlowChatEnabled: boolean = promptFlows.length > 0;

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setIsShow, init } = useInterUseCases();

  const demoChat = () => {
    const params: ChatPageQueryParams = {
      content: `피보나치 수를 반환하는 파이썬 함수를 작성해 주세요. 또한, 구현을 설명해 주세요.
인수는 항으로, 처리는 재귀로 작성해 주세요. 출력은 마크다운으로 작성합니다.`,
      systemContext: '',
    };
    navigate(`/chat?${queryString.stringify(params)}`);
  };

  const demoRag = () => {
    const params: RagPageQueryParams = {
      content: `Claude 의 매개변수를 설명하고 설정하는 방법도 알려주세요.`,
    };
    navigate(`/rag?${queryString.stringify(params)}`);
  };

  const demoRagKnowledgeBase = () => {
    const params: RagPageQueryParams = {
      content: `Claude 의 매개변수를 설명하고 설정하는 방법도 알려주세요.`,
    };
    navigate(`/rag-knowledge-base?${queryString.stringify(params)}`);
  };

  const demoAgent = () => {
    const params: AgentPageQueryParams = {
      content: `generative-ai-use-cases-kr 이란 무엇인가요?`,
    };
    navigate(`/agent?${queryString.stringify(params)}`);
  };

  const demoGenerate = () => {
    const params: GenerateTextPageQueryParams = {
      information: `Amazon Bedrock은 AI21 Labs, Anthropic, Cohere, Meta, Stability AI, Amazon 등 주요 AI 기업이 제공하는 고성능 기반 모델(FM)을 단일 API를 통해 선택할 수 있는 풀 매니지드 서비스다. 또한, 생성형 AI 애플리케이션을 구축하는 데 필요한 다양한 기능을 제공하여 프라이버시와 보안을 유지하면서 개발을 간소화할 수 있으며, Amazon Bedrock의 포괄적인 기능을 통해 다양한 상위 FM을 쉽게 시험해 볼 수 있고, 미세 조정 및 검색 확장 생성(RAG) 등의 기법을 사용하여 데이터를 프라이버시를 유지하면서 기술을 사용하여 데이터를 사용하여 개인 맞춤형으로 조정하고, 여행 예약 및 보험 청구 처리에서 광고 캠페인 생성 및 재고 관리까지 복잡한 비즈니스 작업을 수행하는 관리형 에이전트를 만들 수 있다. 아마존 베드락은 서버리스(serverless)이기 때문에 인프라를 관리할 필요가 없고, 익숙한 AWS 서비스를 통해 이 모든 것을 할 수 있다. 또한, 익숙한 AWS 서비스를 사용하여 생성된 AI 기능을 애플리케이션에 안전하게 통합하고 배포할 수 있다.`,
      context:
        '프레젠테이션을 위해 마크다운 형식으로 챕터를 구성하고, 각 챕터별로 간결하게 설명합니다.',
    };
    navigate(`/generate?${queryString.stringify(params)}`);
  };

  const demoSummarize = () => {
    const params: SummarizePageQueryParams = {
      sentence:
        'Amazon Bedrock은 아마존과 주요 AI 스타트업이 제공하는 기반 모델(FM)을 API를 통해 이용할 수 있는 완전 관리형 서비스다. 아마존 베드락의 서버리스 경험을 통해 사용자는 다양한 FM 중에서 자신의 사용 사례에 가장 적합한 모델을 선택할 수 있으며, 즉시 FM을 시작하고, FM을 쉽게 시험해보고, 자신의 데이터로 FM을 프라이빗하게 커스터마이징하고, AWS의 도구와 기능을 사용하여 FM을 애플리케이션에 적용하는 등 다양한 작업을 수행할 수 있다. Amazon Bedrock의 에이전트는 개발자가 다양한 사용 사례에 대한 작업을 완료할 수 있도록 다양한 지식 소스를 기반으로 최신의 답변을 제공하는 생성형 AI 애플리케이션을 쉽게 개발할 수 있도록 돕는다. Bedrock의 서버리스 경험을 통해 개발자는 인프라를 관리할 필요 없이 즉시 사용을 시작하고, 자신의 데이터로 FM을 프라이빗하게 커스터마이징하고, 익숙한 AWS 툴과 기능을 사용해 애플리케이션에 적용시킬 수 있다. AWS 도구 및 기능을 사용하여 애플리케이션에 쉽게 통합하고 배포할 수 있습니다(다양한 모델을 테스트하기 위한 실험 및 FM을 대규모로 관리하기 위한 파이프라인과 같은 Amazon SageMaker의 ML 기능과의 통합을 포함)',
      additionalContext: '',
    };
    navigate(`/summarize?${queryString.stringify(params)}`);
  };

  const demoEditorial = () => {
    const params: EditorialPageQueryParams = {
      sentence:
        '안녕하세요. 저는 교정을 도와주는 완벽한 AI 어시스턴트입니다. 원하는 문장을 입력하세요.',
    };
    navigate(`/editorial?${queryString.stringify(params)}`);
  };

  const demoTranslate = () => {
    const params: TranslatePageQueryParams = {
      sentence:
        '안녕하세요. 저는 번역을 도와주는 AI 어시스턴트입니다. 원하는 문장을 입력하세요.',
      additionalContext: '',
      language: 'English',
    };
    navigate(`/translate?${queryString.stringify(params)}`);
  };

  const demoWebContent = () => {
    const params: WebContentPageQueryParams = {
      url: 'https://aws.amazon.com/jp/bedrock/',
      context: '',
    };
    navigate(`/web-content?${queryString.stringify(params)}`);
  };

  const demoGenerateImage = () => {
    const params: GenerateImagePageQueryParams = {
      content: `스마트폰 광고 디자인 시안을 출력해 주세요.
귀여운, 세련된, 사용하기 쉬운, POP 문화, 친근한, 젊은층, 음악, 사진, 유행하는 스마트폰, 배경이 도시인`,
    };
    navigate(`/image?${queryString.stringify(params)}`);
  };

  const demoVideoAnalyzer = () => {
    const params: VideoAnalyzerPageQueryParams = {
      content:
        '보이는 것을 설명해 주세요. 만약 비치는 것에 글자가 적혀 있다면 그 글자를 읽어주세요.',
    };
    navigate(`/video?${queryString.stringify(params)}`);
  };

  const demoBlog = () => {
    setIsShow(true);
    init('블로그 글 작성하기', [
      {
        title: '참고 정보 획득',
        description: `URL을 지정하면 기사에서 참고할 만한 정보를 자동으로 가져옵니다.
추가 컨텍스트를 설정하여 원하는 정보만 추출할 수 있습니다.`,
        path: 'web-content',
        params: {
          url: {
            value: 'https://aws.amazon.com/what-is/generative-ai/',
          },
          context: {
            value:
              '생성 AI의 개요, 구조를 설명하는 부분, AWS에 대해 설명하는 부분만 발췌해 주세요.',
          },
        } as InterUseCaseParams<WebContentPageQueryParams>,
      },
      {
        title: '기사 생성',
        description:
          '참고 정보를 바탕으로 블로그 글을 자동 생성합니다. 컨텍스트를 상세하게 설정하면 자신이 의도한 내용으로 글이 생성되기 쉽습니다.',
        path: 'generate',
        params: {
          context: {
            value: `생성 AI의 작동 원리와 AWS에서 생성 AI를 사용하는 이점을 설명하는 블로그 글을 생성해 주세요. 기사를 생성할 때,<rules></rules>를 반드시 지켜주세요.
<rules>
- 마크다운 형식으로 장 단위로 작성해 주세요.
- 생성 AI 및 AWS 초보자를 타깃으로 한 기사로 작성해 주세요.
- IT 초보자가 이해하기 어려운 용어는 사용하지 않거나 쉬운 용어로 대체해 주세요.
- 생성 AI로 무엇을 할 수 있는지 알 수 있는 기사로 작성해 주세요.
- 글의 양이 적으면 독자가 만족하지 않으므로 일반적인 정보는 보완하면서 글의 양을 늘려야 합니다.
- 독자의 흥미를 끌 수 있는 문장으로 작성하세요.
</rules>`,
          },
          information: {
            value: '{content}',
          },
        } as InterUseCaseParams<GenerateTextPageQueryParams>,
      },
      {
        title: '기사 요약',
        description:
          'OGP(기사 링크 공유 시 표시되는 기사 미리보기)를 위해 기사를 요약하고, OGP를 적절히 설정하면 기사가 공유될 때 기사의 개요를 제대로 전달할 수 있습니다.',
        path: 'summarize',
        params: {
          sentence: {
            value: '{text}',
          },
        } as InterUseCaseParams<SummarizePageQueryParams>,
      },
      {
        title: '기사 썸네일 생성',
        description:
          'OGP(기사 링크를 공유할 때 표시되는 기사 미리보기)용 썸네일을 생성합니다. OGP에 눈에 띄는 썸네일을 설정하면 독자의 관심을 끌 수 있을 것입니다.',
        path: 'image',
        params: {
          content: {
            value: `블로그 글의 OGP용 썸네일 이미지를 생성하세요. 클라우드나 AI 기사라는 것을 한눈에 알 수 있는 이미지로 만들어야 합니다.
블로그 글의 개요는 <article></article>로 설정되어 있습니다.
<article>
{summarizedSentence}
</article>`,
          },
        } as InterUseCaseParams<GenerateImagePageQueryParams>,
      },
    ]);
  };

  const demoMeetingReport = () => {
    setIsShow(true);
    init('회의록 작성', [
      {
        title: '회의록',
        description: `'음성 인식' 기능을 사용하여 녹음 데이터에서 대화 내용을 텍스트로 변환합니다. 원하는 음성 파일로 실행하세요.
음성 인식이 완료되면, '정형화' 버튼을 누릅니다(음성 인식 결과는 자동으로 복사됩니다).`,
        path: 'transcribe',
      },
      {
        title: '정형화',
        description:
          '문장 생성 기능을 사용하여 필사 파일을 정형화합니다. 필러워드 제거, 음성 인식이 제대로 이루어지지 않은 부분 등을 보정하여 사람이 이해하기 쉽도록 합니다.',
        path: 'generate',
        params: {
          context: {
            value: `녹음 데이터의 전사 결과가 입력되어 있으므로 <rules></rules>에 따라 정형화해 주세요.
<rules>
- 필러 단어를 제거해 주세요.
- 필사본이 잘못 인식한 것으로 생각되는 내용은 올바른 내용으로 다시 작성해 주세요.
- 접속사 등이 생략된 경우, 읽기 쉽도록 보완해 주세요.
- 질의응답도 생략하지 말고 기재해 주세요.
</rules>`,
          },
          information: {
            value: '{transcript}',
          },
        } as InterUseCaseParams<GenerateTextPageQueryParams>,
      },
      {
        title: '회의록 작성',
        description:
          '문장 생성 기능을 사용하여 회의록을 생성합니다. 컨텍스트를 상세하게 지정하여 회의록의 형식과 기재의 세분화를 지정할 수 있습니다.',
        path: 'generate',
        params: {
          context: {
            value: `회의에서 발언한 내용을 바탕으로 마크다운 형식의 회의록을 작성하세요.
회의에서 이야기한 주제별로 장(章)을 만들고, 논의한 내용, 결정사항, 숙제 등을 정리해 주세요.`,
          },
          information: {
            value: '{text}',
          },
        } as InterUseCaseParams<GenerateTextPageQueryParams>,
      },
    ]);
  };

  const demoPromptFlowChat = () => {
    navigate(`/prompt-flow-chat`);
  };

  return (
    <div className="pb-24">
      <div className="bg-aws-squid-ink flex flex-col items-center justify-center px-3 py-5 text-xl font-semibold text-white lg:flex-row">
        <AwsIcon className="mr-5 size-20" />
        에서 시작하는 생성형 AI
      </div>

      <div className="mx-3 mb-6 mt-5 flex flex-col items-center justify-center text-xs lg:flex-row">
        <Button className="mb-2 mr-0 lg:mb-0 lg:mr-2" onClick={() => {}}>
          시작
        </Button>
        를 클릭하면 각 사용 사례를 경험할 수 있습니다.
      </div>

      <h1 className="mb-6 flex justify-center text-2xl font-bold">
        활용 사례 목록
      </h1>

      <div className="mx-20 grid gap-x-20 gap-y-5 md:grid-cols-1 xl:grid-cols-2">
        <CardDemo
          label="채팅"
          onClickDemo={demoChat}
          icon={<PiChatsCircle />}
          description="LLM과 채팅 형식으로 대화할 수 있습니다. 세세한 사용 사례나 새로운 사용 사례에 빠르게 대응할 수 있습니다. 프롬프트 엔지니어링의 검증용 환경으로도 효과적입니다."
        />
        {ragEnabled && (
          <CardDemo
            label="RAG 채팅"
            sub="Amazon Kendra"
            onClickDemo={demoRag}
            icon={<PiChatCircleText />}
            description="RAG (Retrieval Augmented Generation)는 정보 검색과 LLM의 문장 생성을 결합하여 효과적인 정보 접근을 실현할 수 있는 방법으로, Amazon Kendra에서 가져온 참고 문서를 기반으로 LLM이 답변을 생성해 주기 때문에 '사내 정보에 대응하는 LLM 채팅'을 쉽게 구현할 수 있습니다."
          />
        )}
        {ragKnowledgeBaseEnabled && (
          <CardDemo
            label="RAG 채팅"
            sub="Knowledge Base"
            onClickDemo={demoRagKnowledgeBase}
            icon={<PiChatCircleText />}
            description="RAG (Retrieval Augmented Generation) 는 정보 검색과 LLM의 문장 생성을 결합하여 효과적인 정보 접근을 실현할 수 있는 방법으로, Knowledge Base의 Hybrid Search를 활용하여 참고 문서를 검색하고 LLM이 답변을 생성하는 방식입니다."
          />
        )}
        {agentEnabled && (
          <CardDemo
            label="Agent チャット"
            onClickDemo={demoAgent}
            icon={<PiRobot />}
            description="Agent チャットユースケースでは Agents for Amazon Bedrock を利用してアクションを実行させたり、Knowledge Bases for Amazon Bedrock のベクトルデータベースを参照することが可能です。"
          />
        )}
        {promptFlowChatEnabled && (
          <CardDemo
            label="Prompt Flow 채팅"
            onClickDemo={demoPromptFlowChat}
            icon={<PiFlowArrow />}
            description="Prompt Flow 를 사용하여 여러 단계의 대화형 채팅 플로우를 만들 수 있습니다. 사용자 입력에 따라 다음 단계를 동적으로 결정하여 보다 복잡한 대화 시나리오를 구현합니다."
          />
        )}
        <CardDemo
          label="문장 생성"
          onClickDemo={demoGenerate}
          icon={<PiPencil />}
          description="문장 생성 모든 컨텍스트에서 문장을 생성하는 것은 LLM이 가장 잘 할 수 있는 작업 중 하나입니다. 기사, 보고서, 이메일 등 모든 컨텍스트에 대응합니다."
        />
        <CardDemo
          label="요약"
          onClickDemo={demoSummarize}
          icon={<PiNote />}
          description="LLM은 방대한 양의 글을 요약하는 작업에 능숙합니다. 요약할 때 '한 줄로', '어린이도 이해할 수 있는 언어로' 등 문맥을 부여할 수 있습니다."
        />
        <CardDemo
          label="교정"
          onClickDemo={demoEditorial}
          icon={<PiPenNib />}
          description="LLM은 오탈자 체크뿐만 아니라 글의 흐름과 내용을 고려하여 보다 객관적인 관점에서 개선점을 제안할 수 있습니다. 남에게 보여주기 전에 LLM에게 자신이 미처 발견하지 못한 부분을 객관적으로 점검받음으로써 퀄리티를 높이는 효과를 기대할 수 있습니다."
        />
        <CardDemo
          label="번역"
          onClickDemo={demoTranslate}
          icon={<PiTranslate />}
          description="다국어로 학습한 LLM은 번역도 가능합니다. 또한, 단순히 번역만 하는 것이 아니라 캐주얼성, 대상층 등 다양한 지정된 컨텍스트 정보를 번역에 반영할 수 있습니다."
        />
        <CardDemo
          label="Web 콘텐츠 추출"
          onClickDemo={demoWebContent}
          icon={<PiGlobe />}
          description="블로그, 문서 등의 웹 콘텐츠를 추출하고, LLM을 통해 불필요한 정보를 제거한 후 완성된 문장으로 정형화합니다. 추출된 콘텐츠는 요약, 번역 등 다른 사용 사례에 활용할 수 있습니다."
        />
        <CardDemo
          label="이미지 생성"
          onClickDemo={demoGenerateImage}
          icon={<PiImages />}
          description="이미지 생성 AI는 텍스트나 이미지를 기반으로 새로운 이미지를 생성할 수 있습니다. 아이디어를 즉시 시각화할 수 있어 디자인 작업 등의 효율성을 높일 수 있습니다. 이 기능에서는 LLM이 프롬프트를 생성하는 데 도움을 줄 수 있습니다."
        />
        {visionEnabled && (
          <CardDemo
            label="영상 분석"
            onClickDemo={demoVideoAnalyzer}
            icon={<PiVideoCamera />}
            description="マルチモーダルモデルによってテキストのみではなく、画像を入力することが可能になりました。こちらの機能では、映像の画像フレームとテキストを入力として LLM に分析を依頼します。"
          />
        )}
      </div>

      <h1 className="mb-6 mt-12 flex justify-center text-2xl font-bold">
        더 많은 유스 케이스
      </h1>

      <div className="mx-20 grid gap-x-20 gap-y-5 md:grid-cols-1 xl:grid-cols-2">
        <CardDemo
          label="블로그 글 작성"
          onClickDemo={demoBlog}
          icon={<PiPen />}
          description="여러 사용 사례를 조합하여 블로그 글을 생성합니다. 글의 개요와 썸네일 이미지도 자동 생성하여 OGP 설정도 쉽게 할 수 있습니다. 예를 들어, AWS 공식 웹사이트의 정보를 바탕으로 생성 AI를 소개하는 블로그 글을 생성합니다."
        />
        <CardDemo
          label="회의록 작성"
          onClickDemo={demoMeetingReport}
          icon={<PiNotebook />}
          description="여러 사용 사례를 결합하여 회의 녹음 데이터에서 회의록을 자동으로 생성합니다. 녹취 데이터의 전사, 전사 결과의 정형화, 회의록 작성을 인적 비용 없이 수행할 수 있습니다."
        />
      </div>
    </div>
  );
};

export default LandingPage;

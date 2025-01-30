import React, { useState } from 'react';
import { PiCaretUp } from 'react-icons/pi';
import ButtonCopy from '../ButtonCopy';

type PromptSampleProps = {
  title: string;
  prompt: string;
};
const PromptSample: React.FC<PromptSampleProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-3 rounded border border-gray-400">
      <div
        className="flex cursor-pointer items-center justify-between bg-gray-400 px-2 py-1 text-sm text-white hover:opacity-80"
        onClick={() => {
          setIsOpen(!isOpen);
        }}>
        예시: {props.title}
        <PiCaretUp className={`${isOpen ? 'rotate-180' : ''} transition-all`} />
      </div>
      {isOpen && (
        <pre className="whitespace-pre-wrap break-words bg-gray-100 p-3 text-sm">
          {props.prompt}
          <div className="flex w-full justify-end">
            <ButtonCopy text={props.prompt} />
          </div>
        </pre>
      )}
    </div>
  );
};

const Placeholder: React.FC<{ inputType: string; label?: string }> = (
  props
) => {
  return (
    <span className="rounded bg-gray-200 px-1 py-0.5">
      {`{{${props.inputType}${props.label ? ':' + props.label : ''}}}`}
    </span>
  );
};

const UseCaseBuilderHelp = () => {
  return (
    <div className="flex flex-col gap-y-8 py-4">
      <div className="flex flex-col gap-y-4">
        <div className="text-lg font-bold">プロンプトテンプレートとは？</div>
        <div className="text-sm leading-relaxed">
          생성형 AI
          에 지시를 내리기 위한 '틀'과 같은 것입니다. 목적에 따라 미리 지시문의 틀을 준비해 둘 수 있습니다.
          프롬프트 템플릿은 런타임에 텍스트를 삽입하기 위한 placeholder
          를 정의할 수 있습니다.
        </div>
      </div>

      <div className="flex flex-col gap-y-4">
        <div className="text-lg font-bold">Placeholder</div>
        <div className="text-sm leading-relaxed">
          Placeholder は <Placeholder inputType="입력 유형" label="라벨" />{' '}
          와 같이 작성합니다. 라벨이 식별자가 되기 때문에 동일한 라벨을 가진
          placeholder 는 동일한 입력으로 간주됩니다. 라벨을 생략하고{' '}
          <Placeholder inputType="입력 유형" />{' '}
          와 같이 쓸 수도 있습니다. 이 경우 라벨이 없는 placeholder
          는 동일한 입력으로 간주됩니다. 실제로 실행된 프롬프트는 GenU
          의 대화 기록에서 확인할 수 있습니다.
        </div>
      </div>

      <div className="flex flex-col gap-y-4">
        <div className="text-lg font-bold">Placeholder 一覧</div>

        <div className="flex flex-col gap-y-10">
          <div className="flex flex-col gap-y-4">
            <div className="flex items-center text-base font-bold">
              <Placeholder inputType="text" /> <ButtonCopy text={'{{text}}'} />
            </div>
            <div className="text-sm leading-relaxed">
              <Placeholder inputType="text" /> 는 가장 기본적인 placeholder 입니다.
              <Placeholder inputType="text" /> 또는{' '}
              <Placeholder inputType="text" label="라벨" />{' '}
              のように記述します。
              <Placeholder inputType="text" />{' '}
              는 텍스트 입력을 받는 양식을 생성하고 입력한 값을 프롬프트 템플릿에 그대로 삽입합니다.
              <PromptSample
                title="이메일 답장 예시"
                prompt={`당신은 이메일 회신 담당자입니다.
아래 규칙을 준수하여 답장용 메일을 작성해 주세요.
<규칙
- 거래처에 보내는 메일입니다. 경어를 사용해야 하지만, 관계 구축이 되어 있으므로 너무 딱딱한 문장이 될 필요는 없습니다.
- 답장 대상 메일의 내용을 이해하고, 답장 내용에 맞춰 답장용 메일을 작성해야 합니다.
- 답장 대상 메일과 답장 내용에서 읽을 수 없는 내용은 절대로 메일 문장에 포함시키지 말아야 합니다.
</규칙>
<답장 대상 메일
{{text:회신 대상 메일 본문}}
</회신 대상 메일> <회신 대상 메일>{{text:회신 대상 메일 본문}}
<답장 내용
{{text:회신 내용}}
</ 답장 내용></ 답장 내용>`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-y-4">
            <div className="flex items-center text-base font-bold">
              <Placeholder inputType="form" /> <ButtonCopy text={'{{form}}'} />
            </div>
            <div className="text-sm leading-relaxed">
              <Placeholder inputType="form" /> 는 입력 폼을 정의하기 위한
              placeholder입니다.
              <Placeholder inputType="form" /> 또는{' '}
              <Placeholder inputType="form" label="라벨" />{' '}
              와 같이 설명합니다.
              <Placeholder inputType="form" />{' '}
              는 텍스트 입력을 받는 양식을 생성하지만,
              <span className="font-bold">
              프롬프트 템플릿에 입력을 포함하지 않습니다.
              </span>
              「RAG
              데이터 소스를 쿼리하고 싶지만, 쿼리 내용 자체를 프롬프트에 포함시키고 싶지 않다"는 사용 사례에서 사용합니다.
              <PromptSample
                title="퀴즈 생성"
                prompt={`당신은 주어진 정보를 바탕으로 퀴즈를 생성하는 AI 어시스턴트입니다.

{form:퀴즈의 원천 정보 검색}}

아래 정보를 입력받아 4지선다형 퀴즈를 만들어주세요.
정답도 함께 알려주세요.

<정보
{{retrieveKendra:퀴즈의 원천 정보 검색}}
</정보>{{retrieveKendra:퀴즈 원본 정보 검색}}>`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-y-4">
            <div className="flex items-center text-base font-bold">
              <Placeholder inputType="retrieveKendra" />{' '}
              <ButtonCopy text={'{{retrieveKendra}}'} />
            </div>
            <div className="text-sm leading-relaxed">
              <Placeholder inputType="retrieveKendra" /> は Amazon Kendra から
              retrieve した結果をプロンプトテンプレートに埋め込みます。
              <Placeholder inputType="retrieveKendra" /> あるいは{' '}
              <Placeholder inputType="retrieveKendra" label="ラベル" />{' '}
              のように記述します。
              <Placeholder inputType="retrieveKendra" /> は
              <span className="font-bold">
                検索クエリを入力するための placeholder (
                <Placeholder inputType="text" />) が別に必要
              </span>
              です。それらは同一ラベルである必要があります。
              実際に埋め込まれる値は Amazon Kendra の Retrieve API の{' '}
              <a
                className="text-aws-smile"
                href="https://docs.aws.amazon.com/kendra/latest/APIReference/API_Retrieve.html#API_Retrieve_ResponseSyntax"
                target="_blank">
                ResultItems を JSON にした文字列
              </a>{' '}
              です。 この機能を利用するためには、GenU で RAG チャット (Amazon
              Kendra) が有効になっている必要があります。有効化の方法は{' '}
              <a
                className="text-aws-smile"
                href="https://github.com/aws-samples/generative-ai-use-cases-jp/blob/main/docs/DEPLOY_OPTION.md#rag-%E3%83%81%E3%83%A3%E3%83%83%E3%83%88-amazon-kendra-%E3%83%A6%E3%83%BC%E3%82%B9%E3%82%B1%E3%83%BC%E3%82%B9%E3%81%AE%E6%9C%89%E5%8A%B9%E5%8C%96"
                target="_blank">
                こちら
              </a>
              。
              <PromptSample
                title="シンプルな RAG"
                prompt={`あなたは、ユーザーの質問に答える AI アシスタントです。
以下の情報を読み込んでください。

<情報>
{{retrieveKendra:質問}}
</情報>

上の情報を参考に、以下の質問に答えてください。

<質問>
{{text:質問}}
</質問>`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-y-4">
            <div className="flex items-center text-base font-bold">
              <Placeholder inputType="retrieveKnowledgeBase" />{' '}
              <ButtonCopy text={'{{retrieveKnowledgeBase}}'} />
            </div>
            <div className="text-sm leading-relaxed">
              <Placeholder inputType="retrieveKnowledgeBase" /> 은 Knowledge
              Base에서 retrieve
              한 결과를 프롬프트 템플릿에 삽입합니다.
              <Placeholder inputType="retrieveKnowledgeBase" /> 또는{' '}
              <Placeholder inputType="retrieveKnowledgeBase" label="라벨" />{' '}
              와 같이 설명합니다.
              <Placeholder inputType="retrieveKnowledgeBase" /> は
              <span className="font-bold">
              검색어 입력을 위한 placeholder (
                <Placeholder inputType="text" />) 가 별도로 필요
              </span>
              입니다. 동일한 레이블이어야 합니다.
              실제로 삽입되는 값은 Knowledge Base의 Retrieve API의{' '}
              <a
                className="text-aws-smile"
                href="https://docs.aws.amazon.com/bedrock/latest/APIReference/API_agent-runtime_Retrieve.html#API_agent-runtime_Retrieve_ResponseSyntax"
                target="_blank">
                retrievalResults 를 JSON 으로 변환한 문자열
              </a>{' '}
              입니다. 이 기능을 이용하기 위해서는 GenU에서 RAG 채팅(Knowledge
              Base)가 활성화되어 있어야 합니다. 활성화 방법은{' '}
              <a
                className="text-aws-smile"
                href="https://github.com/aws-samples/generative-ai-use-cases-jp/blob/main/docs/DEPLOY_OPTION.md#rag-%E3%83%81%E3%83%A3%E3%83%83%E3%83%88-knowledge-base-%E3%83%A6%E3%83%BC%E3%82%B9%E3%82%B1%E3%83%BC%E3%82%B9%E3%81%AE%E6%9C%89%E5%8A%B9%E5%8C%96"
                target="_blank">
                여기
              </a>
              。
              <PromptSample
                title="심플한 RAG"
                prompt={`당신은 사용자의 질문에 답하는 AI 어시스턴트입니다.
아래 정보를 입력해 주세요.

<정보
{{retrieveKnowledgeBase:질문}}
<정보>{{retrieveKnowledgeBase:질문}}

위의 정보를 참고하여 아래 질문에 답해 주세요.

<질문
{{text:질문}}
</질문>`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UseCaseBuilderHelp;

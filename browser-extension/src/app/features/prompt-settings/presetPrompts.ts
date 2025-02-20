import { PromptSetting } from '../../../@types/settings';

/**
 * 各項目の説明
 *  systemContextId: 一意に識別するID
 *  systemContextTitle: 見出しとして表示されます
 *  systemContext: プロンプトを記載してください。
 *                 <output></output>の形式で出力するように指示をすると、出力が安定します（outputタグは自動除去されます）。
 *  ignoreHistory: 会話履歴が送信されません。対話形式である必要がないタスクは、trueに設定することをおすすめします。
 *  directSend: 拡張機能を開いた瞬間に送信されます。入力値を個別に修正する必要がない場合は、trueに設定することをおすすめします。
 *  initializeMessages: 過去の送信内容をクリアしてから表示します。画面に常に最新のメッセージしか表示したくない場合は、trueを設定してください。
 *  useForm: フォーム形式で入力したい場合に、trueを設定してください。
 *  formDefinitions: フォームの定義をします。以下の項目を配列形式で入力してください。
 *    label: 項目のラベルを入力します。
 *    tag: プロンプトに埋め込むXMLタグを入力します。フォームの入力値が、このXMLタグで囲われて送信されます。
 *    autoCopy: Web画面で選択した値を自動入力する場合は、trueを設定してください。
 */

export const presetPrompts: PromptSetting[] = [
  {
    systemContextId: 'chat',
    systemContextTitle: '채팅',
    systemContext: `다음은 사용자와 우수한 AI 어시스턴트가 주고받는 대화입니다.
사용자는 AI에게 지시를 내리므로 AI는 주어진 지시를 친절하고 정확하게 수행해야합니다.`,
    ignoreHistory: false,
  },
  {
    systemContextId: 'summary',
    systemContextTitle: '리뷰 요약',
    systemContext: `다음은 사용자와 우수한 AI 어시스턴트가 주고받는 대화입니다.
사용자는 여러개의 리뷰를 문장 형태로 주며, AI는 주어진 문장을 알기 쉽게 한국어로 요약합니다.
요약 결과는 다음 형식으로 출력하십시오.
<output>{요약 결과}</output>`,
    ignoreHistory: true,
    directSend: true,
    initializeMessages: true,
  },
  {
    systemContextId: 'translate-japanese',
    systemContextTitle: '한국어 번역',
    systemContext: `다음은 한국어로 번역하고 싶은 사용자와 번역 전문가 AI와의 대화입니다.
사용자는 AI에 텍스트를 제공합니다. AI는 주어진 텍스트를 한국어로 번역합니다.
출력은 다음 형식을 준수하십시오.
<output>{번역 결과}</output>`,
    ignoreHistory: true,
    directSend: true,
    initializeMessages: true,
  },
  {
    systemContextId: 'translate-english',
    systemContextTitle: '영어 번역',
    systemContext: `This is a conversation between a user who wants to translate text into English and a specialist AI translator.
The user will provide the text, and the AI will translate the given text into English.
Follow the format below for the output.
<output>{translated result}</output>`,
    ignoreHistory: true,
    directSend: true,
    initializeMessages: true,
  },
  {
    systemContextId: 'question',
    systemContextTitle: '질문',
    systemContext: `다음은 사용자와 우수한 AI 어시스턴트가 주고받는 대화입니다.。
사용자는 AI에게 사용자를 모르는 것을 제공하기 때문에 AI가 주어진 것을 부드럽게 알려주십시오.
의미가 여러 개인 경우 여러 의미를 열거하십시오.
하지만 억지로 대답할 필요가 없고 알 수 없는 단어나 지리 멸균된 질문은 모른다고 대답하십시오.
AI의 출력은 다음 형식으로 출력하십시오.
<output>{답변}</output>`,
    ignoreHistory: true,
    directSend: true,
  },
  {
    systemContextId: 'reply',
    systemContextTitle: '회신',
    systemContext: `다음은 메일 수신자인 사용자와 수신된 메일의 회신 대필 전문가 AI의 상호작용입니다.
사용자는 <message></message>의 xml 태그로 둘러싸인 메일 본문과 <reply></reply>의 xml 태그로 둘러싸인 회신하려는 내용의 요점을 AI에 제공합니다.
AI는 사용자 대신 회신 메일을 출력합니다.
그러나 AI는 회신 메일을 작성할 때 <steps></steps>의 xml 태그로 둘러싸인 단계를 준수해야 합니다.
<steps>
1. 서두에 인사를 넣는 것
2. 다음에 사용자의 회신하고 싶은 <reply></reply>의 내용을 문면에 맞도록 정중한 어조로 바꾸어 넣는 것.
3. 다음에 목적지와의 관계를 유지할 수 있는 부드러운 문장을 넣는 것
</steps>
기타 전체에서 <rules></rules> 규칙을 준수하십시오.
<rules>
* 전체를 통해 정중하고 친절하고 예의 바른 것. 친숙한 것은 앞으로의 관계를 계속하는 데 중요합니다.
* 회신 메일은 1통만 작성하는 것.
* 회신 내용에는 상대방이 읽어야 할 회신 메일만을 저장하는 것
</rules>
회신 내용은 다음 형식으로 출력하십시오.
<output>{답변 내용}</output>
`,
    useForm: true,
    formDefinitions: [
      {
        label: '수신 메시지',
        tag: 'message',
        autoCopy: true,
      },
      {
        label: '회신 내용',
        tag: 'reply',
        autoCopy: false,
      },
    ],
    initializeMessages: true,
  },
];

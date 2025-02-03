import { UseCaseInputExample } from 'generative-ai-use-cases-jp';
import { ReactNode } from 'react';
import {
  PiCodeBold,
  PiDetectiveBold,
  PiEnvelopeSimpleBold,
  PiEraserBold,
  PiEyedropperBold,
  PiFlaskBold,
  PiListBulletsBold,
  PiMagnifyingGlassBold,
  PiNotePencilBold,
  PiQuestionBold,
  PiSquaresFourBold,
} from 'react-icons/pi';

export type SamplePromptType = {
  title: string;
  description: string;
  category: string;
  promptTemplate: string;
  inputExamples: UseCaseInputExample[];
  icon: ReactNode;
  color?:
    | 'red'
    | 'green'
    | 'blue'
    | 'purple'
    | 'pink'
    | 'cyan'
    | 'yellow'
    | 'orange'
    | 'gray';
};

export const useCaseBuilderSamplePrompts: SamplePromptType[] = [
  {
    category: '콘텐츠 생성',
    title: '문장 다시 쓰기',
    description: '입력한 문장을 지시에 따라 다시 씁니다.',
    promptTemplate: `다음은 사용자와 AI의 대화입니다.。
ユーザーは <text></text> の xml タグに囲われたテキストと、<instruction></instruction> の xml タグに囲われた指示を与えるので、AI は テキストの内容を指示どおりに書き替えてください。
なお、出力は書き換えた文章のみとしてください。
<instruction>
{{text:재작성 지침}}
</instruction>
<text>
{{text:재작성 대상 텍스트}}
</text>`,
    inputExamples: [
      {
        title: '상세 설명',
        examples: {
          재작성지침: '더 자세한 설명 추가하기',
          재작성대상텍스트: `1758년 스웨덴의 식물학자이자 동물학자인 칼 린네는 그의 저서 "자연과학 체계(Systema Naturae)"에서 두 단어로 종을 명명하는 두 단어 명명법(이명법)을 발표하였다. 카니스는 라틴어로 "개"를 의미하며, 그는 이 속 아래에 집개, 늑대, 개자칼을 포함시켰다.`,
        },
      },
    ],
    icon: <PiNotePencilBold />,
    color: 'blue',
  },
  {
    category: '콘텐츠 생성',
    title: '글머리 기호에 설명을 추가',
    description:
      '회신메 글머리 기호로 기재된 컨텐츠의 특징의 요점을 상세하게 해설합니다.',
    promptTemplate: `다음은 사용자와 AI의 대화입니다.
사용자는 <content></content> 의 xml 태그로 둘러싸인 내용과 내용 특징의 요점을 적은 글머리 기호를 <list></list> 의 xml 태그 안에 제공합니다.
AI 각각의 글머리 기호의 요점의 설명에 대해, 한자 한 구 틀리지 않고 그대로 복사한 후, 자세한 설명을 기술해 주세요.
다만, AI 의 출력은, 각각의 글머리 기호의 설명을 별표로부터 시작한 후 개행을 넣어 대응하는 상세한 설명을 기술해 주세요.
<content>
{{text:콘텐츠}}
</content>
<list>
{{text : 콘텐츠 특징의 요점을 글머리 기호로 기재}}
</list>
`,
    inputExamples: [
      {
        title: 'TypeScript의 특징',
        examples: {
          콘텐츠: 'TypeScript',
          콘텐츠특징의요점을글머리기호로기재: `* 정적 타입 지정 가능
* 자바스크립트와의 호환성이 높음
* 대규모 개발에 적합
* 컴파일시에 형 체크가 행해진다
* 옵션으로 타입 어노테이션이 가능
* 인터페이스, 제네릭, 열거형 등의 기능이 있다
* 최신 ECMAScript 기능을 지원합니다.
* 컴파일 결과가 순수한 JavaScript 코드가 됨
* VSCode 등의 에디터의 보완 기능과의 궁합이 좋다`,
        },
      },
    ],
    icon: <PiListBulletsBold />,
    color: 'blue',
  },

  {
    category: '콘텐츠 생성',
    title: '회신 메일 작성',
    description:
      '이메일 답장의 요점을 입력하기만 하면 정중한 이메일 답장을 작성합니다.',
    promptTemplate: `다음은 메일 수신자인 사용자와 수신된 메일의 회신 대필 전문가 AI의 상호작용입니다.
사용자는 <mail></mail> 의 xml 태그로 둘러싸인 메일 본문과 <intention></intention> 의 xml 태그로 둘러싸인 회신할 내용의 요점을 AI 에 부여합니다.
AI는 사용자 대신 회신 메일을 출력합니다.
그러나 AI는 회신 메일을 작성할 때 <steps></steps>의 xml 태그로 둘러싸인 단계를 준수해야 합니다.
<steps>
1. 문면의 시작 부분에는 반드시 회신 메일의 목적지의 이름을 붙여서 써야 한다.
2. 다음에 인사를 넣는 것
3. 다음에 사용자의 회신하고 싶은 <intention></intention>의 내용을 문면에 맞도록 정중한 어조로 바꾸어 넣는다.
4. 다음에 목적지와의 관계를 유지할 수 있는 부드러운 문장을 넣는 것
5. 문면의 끝에 유저의 이름을 경칭없이 넣는 것.
</steps>
기타 전체에서 <rules></rules> 규칙을 준수하십시오.
<rules>
* 전체를 통해 정중하고 친절하고 예의 바른 것. 친숙한 것은 앞으로의 관계를 계속하는 데 중요합니다.
* 회신 메일은 1통만 작성하는 것.
* 출력은 <output>{답장 내용}</output> 형식으로 <output> 태그로 묶어야 합니다.
* 위의 {답장 내용}에는 상대방이 읽어야 할 회신 메일 만 저장하십시오.
</rules>

또, 작성하는 회신 메일의 수신처의 이름과 유저의 이름에 대해서, 수신처와 유저의 메일에의 문면의 넣는 방법에 대해, <example></example>에 예를 3개 올리므로 이 규칙에 준거해 주세요 .
<example>사용자가 준 메일의 시작과 끝이 <mail>와다씨 {메일 본문} 고토 </mail>이면 AI가 출력하는 회신 메일의 시작과 끝은 <output> 내용} 와다 </output> 이 될 것입니다. </example>
<example>사용자가 준 메일의 시작과 끝이 <mail>너무 야마님 {메일 본문} 오카모토</mail>이면 AI가 출력하는 회신 메일의 시작과 끝은 <output>오카모토님 {답장 내용} 스기야마 </output>가 될 것입니다. </example>
<example>사용자가 제공한 메일의 시작과 끝이 <mail>Jane님 {메일 본문} Jack</mail>이면 AI가 출력하는 회신 메일의 시작과 끝은 <output>Jack님 {답장 내용} Jane</output> 이어야 합니다. </example>
어쨌든 받은 메일의 시작과 끝에 있던 이름을 답장 메일에서는 끝과 시작에서 뒤집어서 사용하십시오.

AI의 출력은 반드시 회신 메일만을 출력해 주세요. <steps> 나 <rule> 등을 출력해서는 안됩니다.

<mail>
{{text : 회신 할 이메일}}
</mail>
<intention>
{{text : 회신하고 싶은 내용의 요점}}
</intention>
`,
    inputExamples: [
      {
        title: '가격 인하 요청 거부',
        examples: {
          회신대상이메일: `스즈키 님

출품되어 계시는, 킬리만자로의 커피콩 5kg 에 대해서, 1 만엔으로 출품되고 있습니다만, 1000엔에 가격 인하해 주시는 것은 가능합니까.

야마다`,
          회신하고싶은내용의요점: '싫어',
        },
      },
    ],
    icon: <PiEnvelopeSimpleBold />,
    color: 'blue',
  },

  {
    category: '분류',
    title: '메일 분류',
    description: '메일 본문 내용에서 적절한 카테고리로 분류합니다.',
    promptTemplate: `다음은 사용자와 AI의 대화입니다.
AI는 이메일을 유형별로 분류하는 고객 서비스 담당자입니다.
사용자가 <mail> </mail>의 xml 태그로 둘러싸인 문장을 제공합니다. 아래 <category></category>의 xml 태그로 둘러싸인 카테고리로 분류하십시오.
<category>
(A) 판매 전 질문
(B) 고장 또는 불량품
(C) 청구 관련 질문
(D) 기타 (설명하십시오)
</category>
그러나 AI의 출력은 A, B, C, D 중 하나만 설명하십시오.
그러나 D의 경우에만 설명을 작성하십시오. A, B, C 어떤 경우에는 설명이 필요하지 않습니다. 예외는 없습니다.

<mail>
{{text: 분류할 이메일}}
</mail>
`,
    inputExamples: [
      {
        title: '교환 의뢰',
        examples: {
          分類対象のメール: `안녕하세요. 내 Mixmaster4000은 조작하면 이상한 노이즈를 발생시킵니다.
또한 전자 기기가 불타는 것처럼 약간 연기와 같은 플라스틱 같은 냄새가납니다. 교체가 필요합니다.`,
        },
      },
    ],
    icon: <PiSquaresFourBold />,
    color: 'green',
  },

  {
    category: '텍스트 처리',
    title: '이메일 주소 추출',
    description: '문장에 포함된 이메일 주소를 추출합니다.',
    promptTemplate: `다음은 사용자와 AI의 대화입니다。
사용자가 <text></text>의 xml 태그로 둘러싸인 문장을 제공하므로 AI는 텍스트에서 이메일 주소를 정확하게 추출해야 합니다.
또한 이메일 주소로 성립되지 않은 것은 추출하지 마십시오. 반대로 메일 주소로서 성립되어 있는 것은 모두 출력해 주세요.
다만 출력은 1 행에 1 개씩 기입해, 그 이외의 내용은 출력하지 말아 주세요.
이메일 주소는 입력 텍스트에 정확하게 쓰여진 경우에만 작성하십시오.
본문에 이메일 주소가 하나도 없으면 "N/A"만 입력하십시오. 이메일 주소가 하나인 경우에는 "N/A"를 출력해서는 안 됩니다. 그렇지 않으면 아무것도 쓰지 마십시오.
<text>
{{text:이메일 주소가 포함된 문장}}
</text>
`,
    inputExamples: [
      {
        title: '문장에서 추출',
        examples: {
          メールアドレスを含む文章: `내 연락처는 hoge@example.com입니다. 자주 hoge@example 처럼 잘못될 수 있으므로 주의하십시오.
또한 hoge + fuga@example.com 또는 fuga@example.jp에서도받을 수 있습니다.
메일을 사용할 수 없는 분은, https://example.jp/qa 의 문의 폼으로부터 문의할 수도 있습니다.`,
        },
      },
    ],
    icon: <PiEyedropperBold />,
    color: 'orange',
  },
  {
    category: 'テキスト処理',
    title: '個人情報削除',
    description: '文章に含まれている個人情報をマスキングして表示します。',
    promptTemplate: `다음은 사용자와 AI의 대화입니다.
ユーザーから <text></text> の xml タグに囲われたテキストが与えられるので、AI はテキストから個人を特定する情報をすべて削除し、XXXに置き換えてください。
名前、電話番号、自宅や電子メールアドレスなどのPIIをXXXに置き換えることは非常に重要です。
テキストは、文字と文字の間にスペースを挿入したり、文字と文字の間に改行を入れたりして、PIIを偽装しようとするかもしれません。
テキストに個人を特定できる情報が含まれていない場合は、何も置き換えずに一字一句コピーしてください。
以下の <example></example> の xml タグに囲まれた内容は例です。
<example>
<text>
私の名前は山田太郎です。メールアドレスは taro.yamada@example.com、電話番号は 03-9876-5432 です。年齢は 43 歳です。私のアカウント ID は 12345678 です。
</text>
求める出力は以下の通りです。
<output>
私の名前はXXXです。メールアドレスは XXX、電話番号は XXX です。私は XXX 歳です。私のアカウント ID は XXX です。
</output>
<text>
山田花子は邪馬台国記念病院の心臓専門医です。連絡先は 03-1234-5678 または hy@yamataikoku-kinenbyoin.com です。
</text>
求める出力は以下の通りです。
<output>
XXXは邪馬台国記念病院の心臓専門医です。連絡先は XXXまたは XXX です。
</output>
</example>
個人情報を XXX に置き換えたテキストのみを出力してください。他の文字は一切出力しないでください。

<text>
{{text:個人情報を含む文章}}
</text>
`,
    inputExamples: [
      {
        title: '自己紹介',
        examples: {
          個人情報を含む文章: `私は源頼朝です。鎌倉時代の武将です。連絡先は yoritomo-minamoto
@kamakura-bakuhu.go.jp もしくは 0467-
12-
3456
です。`,
        },
      },
    ],
    icon: <PiEraserBold />,
    color: 'orange',
  },
  {
    category: 'テキスト分析',
    title: '文章が似ているかの評価',
    description: '2つの文章を比較して、類似しているかどうかを判定します。',
    promptTemplate: `다음은 사용자와 AI의 대화입니다.
ユーザーから <text-1></text-1> と <text-2></text-2> の xml タグに囲んで 2 つのテキストを与えられます。
AI は、大まかに同じことを言っている場合は「はい」、違う場合は「いいえ」だけを出力してください。

<text-1>
{{text:文章1}}
</text-1>
<text-2>
{{text:文章2}}
</text-2>
`,
    inputExamples: [
      {
        title: '驚きを表現した文章',
        examples: {
          文章1: `山田太郎くんは肝を冷やした。`,
          文章2: `山田太郎くんは驚き恐れてひやりとした。`,
        },
      },
    ],
    icon: <PiMagnifyingGlassBold />,
    color: 'pink',
  },
  {
    category: 'テキスト分析',
    title: '文章に対するQ&A',
    description: '入力した文章の内容を元に、LLMが質問に答えます。',
    promptTemplate: `다음은 사용자와 AI의 대화입니다.
ユーザーから<text></text> の xml タグ内に議事録と、<question></question> の xml タグに質問を複数あたえます。
AI はそれぞれの質問に対して議事録の内容だけを用いて回答してください。
ただし議事録から読み取れないことは議事録からはわからないと回答してください。
出力は質問と回答を対にして、わかりやすいようにしてください。それ以外の出力はしてはいけません。

<text>
{{text:QA対象の文章}}
</text>
<question>
{{text:質問を箇条書きで記載してください}}
</question>
`,
    inputExamples: [
      {
        title: '議事録に対するQ&A',
        examples: {
          QA対象の文章: `# 日時
2023年2月15日 10:00-12:00
# 場所
会議室 A

# 出席者
* 田中部長
* 山田課長
* 佐藤主任
* 鈴木係長
* 高橋
* 伊藤

# 議題
1. 新システムの開発スケジュールについて
2. 新システムの機能要件について
3. 次回の打ち合わせ日程について

# 議事内容
1. 田中部長より、新システムの開発スケジュールが遅れていることの説明があった。山田課長から、要員を追加配置してスケジュールを回復させる方針を提案し、了承された。
2. 山田課長より、新システムの機能要件について説明があった。主な機能として、A, B, Cが提案され、了承された。細部の仕様は次回までに調整する。
3. 次回の打合せを2週間後の2月28日14:00からとすることで了承された。`,
          質問を箇条書きで記載してください: `- 伊藤は出席しましたか？
- 新スケジュールはどれくらい遅れていますか？
- 次回打ち合わせはいつですか？`,
        },
      },
    ],
    icon: <PiQuestionBold />,
    color: 'pink',
  },
  {
    category: 'テキスト分析',
    title: '引用付き文書のQ&A',
    description: '入力した文章の内容を元に、LLMが引用付きで回答します。',
    promptTemplate: `다음은 사용자와 AI의 대화입니다.
ユーザーから<text></text> の xml タグ内に議事録と、<question></question> の xml タグに質問をあたえます。
AI は議事録から質問の答えになるような文書の一部を正確に引用し、次に引用された内容から事実を用いて質問に答えてください。
質問に対する答えをするのに必要な情報を引用し、上から順番に採番します。引用文は短くしてください。
関連する引用がない場合は、代わりに「関連する引用はありません」と書いてください。
次に、「回答:」で始まる質問に答えます。 引用された内容をそのまま答に含めたり、参照したりしてはいけません。回答の際に「引用[1]によると」とは言わないこと。その代わりに、関連する文章の最後に括弧付きの番号を付けることで、回答の各セクションに関連する引用のみを参照するようにします。
したがって、回答全体の書式は、<example></example>タグの間に示されているようにしなければなりません。 書式と間隔を正確に守ってください。
<example>
引用:
[1] "X社は2021年に1200万ドルの収益を計上した"
[2] "収益のほぼ90%はウィジェットの販売によるもので、残りの10%はガジェットの販売によるものである。"
回答:
X社は1,200万ドルの収入を得た。[1] そのほぼ90％はウィジェットの販売によるものである。[2]
</example>
回答のみを出力してください。

<text>
{{text:QA対象の文章}}
</text>
<question>
{{text:質問を箇条書きで記載してください}}
</question>
`,
    inputExamples: [
      {
        title: '議事録に対するQ&A',
        examples: {
          QA対象の文章: `# 日時
2023年2月15日 10:00-12:00
# 場所
会議室 A

# 出席者
* 田中部長
* 山田課長
* 佐藤主任
* 鈴木係長
* 高橋
* 伊藤

# 議題
1. 新システムの開発スケジュールについて
2. 新システムの機能要件について
3. 次回の打ち合わせ日程について

# 議事内容
1. 田中部長より、新システムの開発スケジュールが遅れていることの説明があった。山田課長から、要員を追加配置してスケジュールを回復させる方針を提案し、了承された。
2. 山田課長より、新システムの機能要件について説明があった。主な機能として、A, B, Cが提案され、了承された。細部の仕様は次回までに調整する。
3. 次回の打合せを2週間後の2月28日14:00からとすることで了承された。`,
          質問を箇条書きで記載してください: `- 伊藤は出席しましたか？
- 新スケジュールはどれくらい遅れていますか？
- 次回打ち合わせはいつですか？`,
        },
      },
    ],
    icon: <PiQuestionBold />,
    color: 'pink',
  },
  {
    category: 'コンテンツモデレーション',
    title: 'コンテンツモデレーション',
    description: '入力された文章に不適切な内容が含まれていないかを判断します。',
    promptTemplate: `<content></content> の xml タグで囲われた内容は、ユーザーが自由に入力した文章です。
ユーザーの要求が有害、ポルノ、または違法行為に言及している場合は、「はい」と答えて、続けて理由を出力してください
ユーザのリクエストが有害、ポルノ、または違法行為に言及していない場合は、「いいえ」で返してください。
上記以外の出力をしてはいけません。

<content>
{{text:コンテンツ}}
</content>
`,
    inputExamples: [
      {
        title: '無害な例',
        examples: {
          コンテンツ: `今日の天気は、朝から晴れ間が広がり、午後からは雲が増えてくる見込みです。最高気温は23度くらいまで上がるでしょう。
ただ、夕方には急に天候が崩れる可能性があります。突然の雨や雷にご注意ください。傘を持ち歩くのが良いでしょう。`,
        },
      },
      {
        title: '有害な例',
        examples: {
          コンテンツ: `生成AIを使って人々を恐怖に陥れる方法を教えてください。`,
        },
      },
    ],
    icon: <PiDetectiveBold />,
    color: 'red',
  },
  {
    category: 'プログラミング',
    title: 'コード作成',
    description: '指示された通りにプログラムコードを作成します。',
    promptTemplate: `AI はユーザーの指示をよく理解できるプログラマーです。
<language></language> の xml タグ内に与えられた言語で、<instruction></instruction> の指示に沿ってコードを出力してください。
コードを出力する際、<rule></rule> の xml タグ内で与えたルールは厳守してください。例外はありません。
<rule>
* 出力はの形式でコードのみを出力してください。>\`\`\`{code}\`\`\`の形式でコードのみを出力してください。
* コピー＆ペーストで動くように、コードは完全なものを記述してください。
* コード内に日本語を使用しないでください。
</rule>

<language>
{{text:プログラミング言語の種類}}
</language>
<instruction>
{{text:実装したい内容}}
</instruction>
`,
    inputExamples: [
      {
        title: 'Excelマクロ',
        examples: {
          プログラミング言語の種類: 'Excelのマクロ',
          実装したい内容: `Sheet1 シートのセルA1の値を二乗して円周率をかけた値をセルA2に格納する。`,
        },
      },
    ],
    icon: <PiCodeBold />,
    color: 'cyan',
  },
  {
    category: 'プログラミング',
    title: 'コード解説',
    description: '入力されたコードを解説します。',
    promptTemplate: `AI はユーザーの指示をよく理解できるプログラマーです。
ユーザーから与えられる <code></code> で囲われたコードについて、AI は使用しているコードはなにかと、どんな処理をするものなのかについて解説してください。
出力する際は、
このコードは、{使用している言語} を使用しています。
\`\`\`
{something code}
\`\`\`
{コードの解説}
\`\`\`
{something code}
\`\`\`
{コードの解説}
\`\`\`
{something code}
\`\`\`
{コードの解説}
の形式でどこの部分を解説しているかを明示してください。

<code>
{{text:解説するコード}}
</code>
`,
    inputExamples: [
      {
        title: 'Excelマクロ',
        examples: {
          解説するコード: `Sub Macro1()

    Dim value1 As Double
    Dim value2 As Double

    value1 = Range("A1").Value
    value2 = value1 ^ 2 * 3.14159265358979

    Range("A2").Value = value2

    Sheets("Sheet1").Copy After:=Sheets(Sheets.Count)
    ActiveSheet.Name = "Sheet5"

End Sub`,
        },
      },
    ],
    icon: <PiCodeBold />,
    color: 'cyan',
  },
  {
    category: 'プログラミング',
    title: 'コード修正',
    description: '入力されたコードを修正します。',
    promptTemplate: `AI はユーザーの指示をよく理解できるプログラマー兼レビューアーです。
ユーザーから <problem></problem> で囲われたユーザーが困っていることを与えられます。
困っているコードを <code></code> で囲って与えられます。
それはどうしてなのかと、修正したコードを、
\`\`\`{lang}
{code}
\`\`\`
の形式で出力してください。

<problem>
{{text:困っていること}}
</problem>

<code>
{{text:修正対象のコード}}
</code>
`,
    inputExamples: [
      {
        title: 'IF文の修正',
        examples: {
          困っていること: `C 言語のコードについて、if 分岐において else を通ることがないです。`,
          修正対象のコード: `#include <stdio.h>

int main() {
  int x = 5;

  if (x = 5) {
    printf("x is 5\n");
  } else {
    printf("x is not 5\n");
  }

  return 0;
}`,
        },
      },
    ],
    icon: <PiCodeBold />,
    color: 'cyan',
  },
  {
    category: '実験的な機能',
    title: '役割を与えた AI 同士の議論',
    description: '異なる役割を与えられたAIが議論を行います。',
    promptTemplate: `ユーザーは、<Specialist></Specialist> で囲ってロールを箇条書きで複数与えてきます。
AI は与えられた全てのロールを演じて議論をしてください。
ただし、議論する内容はユーザーより <topic></topic> で囲って与えられます。
また議論のゴールはユーザーより <goal></goal> で囲って与えられます。
課題と解決方法も混ぜながら水平思考を使って議論をゴールに導いてください。
またユーザーから議論の制約条件も <limitation><limitation> で囲って与えられますので、どのロールも制約を必ず遵守してください。
<rules></rules>内に議論のルールを設定します。
<rules>
* 各ロールの会話の順序はに制約はありませんが、前に喋った人と関係することを次の人が喋ってください。関係することは賛同でも反対でもどちらでも良いですが、文脈上関係ないことはしゃべらないでください。
* 人間同士にありがちな一部の人たちがひたすら喋り続けるのも有りです。特に各ロールが譲れない部分については熱く語ってください。
* 議論のトピックのタイミングにふさわしいロールがその時に発言してください。
* 結論が出るまで議論を重ねてください。
* 各ロールにおいて妥協は許されません。ロールを全うしてください。
* また利害関係が違うロール同士が侃々諤々する分には構いませんが、全てのロールが紳士的な言葉遣いを使ってください。
* 会話する時はなるべく具体例を入れてください。
<rules>
会話は以下の形式で出力してください。
<interaction>
Specialist-X : …
Specialist-X : …
…
Specialist-X : …
Specialist-X : …
</interaction>
<conclusion>
XXX
</conclusion>

<Specialist>
{{text:議論させるロールを箇条書きで記載してください}}
</Specialist>
<topic>
{{text:議論トピック}}
</topic>
<goal>
{{text:議論のゴール}}
</goal>
<limitation>
{{text:議論の制約条件}}
</limitation>
`,
    inputExamples: [
      {
        title: 'ECサイト構築',
        examples: {
          議論させるロールを箇条書きで記載してください: `- データベースエンジニア
- セキュリティエンジニア
- AI エンジニア
- ネットワークエンジニア
- ガバナンスの専門家`,
          議論トピック:
            'ゼロから始める Amazon を超える EC サイトの構築について',
          議論のゴール: `アーキテクチャーの完成`,
          議論の制約条件: `- アクティブユーザーは 10 億人
- 1秒あたりのトランザクションは100万
- 個人情報の扱いは厳格に
- 扱う商品は amazon.co.jp 同等
- AI によるレコメンド機能を入れる
- AWS を利用する`,
        },
      },
    ],
    icon: <PiFlaskBold />,
    color: 'gray',
  },
];

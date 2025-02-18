import useVersion from '../hooks/useVersion';
import { Link } from 'react-router-dom';
import Help from '../components/Help';
import Alert from '../components/Alert';
import Button from '../components/Button';
import { MODELS } from '../hooks/useModel';
//import useGitHub, { PullRequest } from '../hooks/useGitHub';
//import { PiGithubLogoFill, PiArrowSquareOut } from 'react-icons/pi';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useCallback } from 'react';
import { useSWRConfig } from 'swr';

//const ragEnabled: boolean = import.meta.env.VITE_APP_RAG_ENABLED === 'true';
const ragKnowledgeBaseEnabled: boolean =
  import.meta.env.VITE_APP_RAG_KNOWLEDGE_BASE_ENABLED === 'true';
//const agentEnabled: boolean = import.meta.env.VITE_APP_AGENT_ENABLED === 'true';

const SettingItem = (props: {
  name: string;
  value: string;
  helpMessage?: string;
}) => {
  return (
    <div className="border-aws-squid-ink mb-2 w-2/3 border-b-2 border-solid lg:w-1/2">
      <div className="flex justify-between py-0.5">
        <div className="flex items-center">
          {props.name}
          {props.helpMessage && <Help message={props.helpMessage} />}
        </div>
        <div className="text-right">{props.value}</div>
      </div>
    </div>
  );
};

const Setting = () => {
  // 원래거 const { modelRegion, modelIds, imageGenModelIds, agentNames } = MODELS;
  const { modelRegion, modelIds, imageGenModelIds } = MODELS;
  const { cache } = useSWRConfig();
  const { getLocalVersion, getHasUpdate } = useVersion();
  //const { getClosedPullRequests } = useGitHub();
  const { signOut } = useAuthenticator();

  const localVersion = getLocalVersion();
  const hasUpdate = getHasUpdate();
  //const closedPullRequests = getClosedPullRequests();

  const onClickSignout = useCallback(() => {
    // SWRのキャッシュを全て削除する
    for (const key of cache.keys()) {
      cache.delete(key);
    }
    signOut();
  }, [cache, signOut]);

  return (
    <div>
      <div className="invisible my-0 flex h-0 items-center justify-center text-xl font-semibold lg:visible lg:my-5 lg:h-min print:visible print:my-5 print:h-min">
        설정 정보
      </div>

      {hasUpdate && (
        <div className="mt-5 flex w-full justify-center">
          <Alert severity="info" className="flex w-fit items-center">
            GitHub에 업데이트가 있습니다. 최신 기능을 사용하려면
            <Link
              className="text-aws-smile"
              to="https://https://github.com/jypark1454/generative-ai-use-cases-kr"
              target="_blank">
              generative-ai-use-cases-jp
            </Link>
            의 main 브랜치를 pull 하고 다시 배포하세요
          </Alert>
        </div>
      )}

      <div className="my-3 flex justify-center font-semibold">일반</div>

      <div className="flex w-full flex-col items-center text-sm">
        <SettingItem
          name="버전"
          value={localVersion || '얻을 수 없습니다.'}
          helpMessage="generative-ai-use-cases-kr package.json version을 참조합니다."
        />
        {/* <SettingItem
          name="RAG (Amazon Kendra) 유효"
          value={ragEnabled.toString()}
        /> */}
        <SettingItem
          name="RAG (Knowledge Base) 유효"
          value={ragKnowledgeBaseEnabled.toString()}
        />
        {/*
        <SettingItem name="Agent 유효" value={agentEnabled.toString()} />
        */}
      </div>

      <div className="my-3 flex justify-center font-semibold">생성형 AI</div>

      <div className="flex w-full flex-col items-center text-sm">
        <SettingItem name="LLM 모델명" value={modelIds.join(', ')} />
        <SettingItem
          name="이미지 생성 모델명"
          value={imageGenModelIds.join(', ')}
        />
        {/* 
        <SettingItem name="Agent 이름" value={agentNames.join(', ')} />
        */}
        <SettingItem
          name="LLM & 이미지 생성 모델 리전"
          value={modelRegion}
        />
        <div className="mt-5 w-2/3 text-xs lg:w-1/2">
          설정 변경은 이 화면이 아니라
          <Link
            className="text-aws-smile"
            to="https://docs.aws.amazon.com/ko_kr/cdk/v2/guide/home.html"
            target="_blank">
            AWS CDK
          </Link>
          로 합니다. 또한 유스 케이스를 실행할 때 오류가 발생하면 항상
          <span className="font-bold">{modelRegion}</span> 에서 지정한 모델
          를 활성화했는지 확인합니다. 각 방법에 대해
          <Link
            className="text-aws-smile"
            to="https://github.com/jypark1454/generative-ai-use-cases-kr"
            target="_blank">
            generative-ai-use-cases-kr
          </Link>
          를 참조하십시오.
        </div>
      </div>

      {/*}
      <div className="mb-3 mt-8 flex items-center justify-center font-semibold">
        <PiGithubLogoFill className="mr-2 text-lg" />
        최근 업데이트
      </div>

      <div className="flex flex-col items-center text-sm">
        <ul className="h-64 w-2/3 overflow-y-scroll border border-gray-400 p-1 lg:w-1/2">
          {closedPullRequests.map((p: PullRequest, idx: number) => {
            return (
              <li key={idx} className="block truncate text-sm">
                <a href={p.url} className="hover:underline" target="_blank">
                  {p.mergedAt.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}{' '}
                  {p.title}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="mt-1 flex w-2/3 justify-end text-xs lg:w-1/2">
          <a
            href="https://github.com/jypark1454/generative-ai-use-cases-kr/pulls"
            className="flex items-center hover:underline"
            target="_blank">
            <PiArrowSquareOut className="mr-1 text-base" />
            모든 업데이트 보기
          </a>
        </div>
      </div>
      */}

      <div className="my-10 flex w-full justify-center">
        <Button onClick={onClickSignout} className="text-lg">
          로그아웃
        </Button>
      </div>
    </div>
  );
};

export default Setting;

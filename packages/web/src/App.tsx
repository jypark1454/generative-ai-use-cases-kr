import React, { useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  PiList,
  PiHouse,
  PiChatCircleText,
  //PiPencil,
  PiNote,
  PiChatsCircle,
  PiPenNib,
  PiMagnifyingGlass,
  PiTranslate,
  PiImages,
  //PiSpeakerHighBold,
  PiGear,
  PiGlobe,
  PiX,
  PiRobot,
  //PiVideoCamera,
  PiFlowArrow,
  PiMagicWand,
} from 'react-icons/pi';
import { Outlet } from 'react-router-dom';
import Drawer, { ItemProps } from './components/Drawer';
import ButtonIcon from './components/ButtonIcon';
import '@aws-amplify/ui-react/styles.css';
import useDrawer from './hooks/useDrawer';
import useChatList from './hooks/useChatList';
import PopupInterUseCasesDemo from './components/PopupInterUseCasesDemo';
import useInterUseCases from './hooks/useInterUseCases';
//import { MODELS } from './hooks/useModel';
import useScreen from './hooks/useScreen';
import { optimizePromptEnabled } from './hooks/useOptimizePrompt';

const ragEnabled: boolean = import.meta.env.VITE_APP_RAG_ENABLED === 'true';
const ragKnowledgeBaseEnabled: boolean =
  import.meta.env.VITE_APP_RAG_KNOWLEDGE_BASE_ENABLED === 'true';
const agentEnabled: boolean = import.meta.env.VITE_APP_AGENT_ENABLED === 'true';
//const { visionEnabled } = MODELS;
const getPromptFlows = () => {
  try {
    return JSON.parse(import.meta.env.VITE_APP_PROMPT_FLOWS);
  } catch (e) {
    return [];
  }
};
const promptFlows = getPromptFlows();
const promptFlowChatEnabled: boolean = promptFlows.length > 0;

const items: ItemProps[] = [
  {
    label: 'Home',
    to: '/',
    icon: <PiHouse />,
    display: 'usecase' as const,
  },
  {
    label: 'Setting',
    to: '/setting',
    icon: <PiGear />,
    display: 'none' as const,
  },
  {
    label: 'Chat',
    to: '/chat',
    icon: <PiChatsCircle />,
    display: 'usecase' as const,
  },
  ragEnabled
    ? {
        label: 'RAG Chat(Kendra)',
        to: '/rag',
        icon: <PiChatCircleText />,
        display: 'usecase' as const,
        sub: 'Amazon Kendra',
      }
    : null,
  ragKnowledgeBaseEnabled
    ? {
        label: 'RAG Chat(KB)',
        to: '/rag-knowledge-base',
        icon: <PiChatCircleText />,
        display: 'usecase' as const,
        sub: 'Knowledge Base',
      }
    : null,
  agentEnabled
    ? {
        label: 'Agent Chat',
        to: '/agent',
        icon: <PiRobot />,
        display: 'usecase' as const,
      }
    : null,
  promptFlowChatEnabled
    ? {
        label: 'Prompt Flow Chat',
        to: '/prompt-flow-chat',
        icon: <PiFlowArrow />,
        display: 'usecase' as const,
      }
    : null,
  
  /*
  {
    label: '문장 생성',
    to: '/generate',
    icon: <PiPencil />,
    display: 'usecase' as const,
  },
  */
  {
    label: '리뷰 추출',
    to: '/web-content',
    icon: <PiGlobe />,
    display: 'usecase' as const,
  },

  {
    label: '리뷰 요약',
    to: '/summarize',
    icon: <PiNote />,
    display: 'usecase' as const,
  },
  {
    label: '교정',
    to: '/editorial',
    icon: <PiPenNib />,
    display: 'usecase' as const,
  },
  {
    label: '번역',
    to: '/translate',
    icon: <PiTranslate />,
    display: 'usecase' as const,
  },
  {
    label: '이미지 생성',
    to: '/image',
    icon: <PiImages />,
    display: 'usecase' as const,
  },
  /*
  visionEnabled
    ? {
        label: '영상 분석',
        to: '/video',
        icon: <PiVideoCamera />,
        display: 'usecase' as const,
      }
    : null,
  */
  /*
  {
    label: '음성인식',
    to: '/transcribe',
    icon: <PiSpeakerHighBold />,
    display: 'tool' as const,
  },
  */
  optimizePromptEnabled
    ? {
        label: '프롬프트 최적화',
        to: '/optimize',
        icon: <PiMagicWand />,
        display: 'tool' as const,
      }
    : null,
  ragEnabled
    ? {
        label: 'Kendra 검색',
        to: '/kendra',
        icon: <PiMagnifyingGlass />,
        display: 'tool' as const,
      }
    : null,
].flatMap((i) => (i !== null ? [i] : []));

// /chat/:chatId 형식에서 :chatId 반환
// path 가 다른형식인 경우 null 반환
const extractChatId = (path: string): string | null => {
  const pattern = /\/chat\/(.+)/;
  const match = path.match(pattern);

  return match ? match[1] : null;
};

const App: React.FC = () => {
  const { switchOpen: switchDrawer, opened: isOpenDrawer } = useDrawer();
  const { pathname } = useLocation();
  const { getChatTitle } = useChatList();
  const { isShow } = useInterUseCases();
  const { screen, notifyScreen, scrollTopAnchorRef, scrollBottomAnchorRef } =
    useScreen();

  const label = useMemo(() => {
    const chatId = extractChatId(pathname);

    if (chatId) {
      return getChatTitle(chatId) || '';
    } else {
      return items.find((i) => i.to === pathname)?.label || '';
    }
  }, [pathname, getChatTitle]);

  // 화면 전환 시 스크롤 이벤트가 발동되지 않는 경우 (페이지 상단에서 페이지 상단으로 이동 등)
  // 최상위/최하위 판단이 되지 않으므로 pathname 변경에 따라 재판정한다.
  useEffect(() => {
    if (screen.current) {
      notifyScreen(screen.current);
    }
  }, [pathname, screen, notifyScreen]);

  return (
    <div
      className="screen:w-screen screen:h-screen overflow-x-hidden overflow-y-scroll"
      ref={screen}>
      <main className="flex-1">
        <div ref={scrollTopAnchorRef}></div>
        <header className="bg-aws-squid-ink visible flex h-12 w-full items-center justify-between text-lg text-white lg:invisible lg:h-0 print:hidden">
          <div className="flex w-10 items-center justify-start">
            <button
              className="focus:ring-aws-sky mr-2 rounded-full  p-2 hover:opacity-50 focus:outline-none focus:ring-1"
              onClick={() => {
                switchDrawer();
              }}>
              <PiList />
            </button>
          </div>

          {label}

          {/* label 를 가운데에 배치하기 위한 더미 블록 */}
          <div className="w-10" />
        </header>

        <div
          className={`fixed -left-64 top-0 z-50 transition-all lg:left-0 lg:z-0 ${
            isOpenDrawer ? 'left-0' : '-left-64'
          }`}>
          <Drawer items={items} />
        </div>

        <div
          id="smallDrawerFiller"
          className={`${isOpenDrawer ? 'visible' : 'invisible'} lg:invisible`}>
          <div
            className="screen:h-screen fixed top-0 z-40 w-screen bg-gray-900/90"
            onClick={switchDrawer}></div>
          <ButtonIcon
            className="fixed left-64 top-0 z-40 text-white"
            onClick={switchDrawer}>
            <PiX />
          </ButtonIcon>
        </div>
        <div className="text-aws-font-color lg:ml-64">
          {/* 유스케이스 간 연동 시 표시 */}
          {isShow && <PopupInterUseCasesDemo />}
          <Outlet />
        </div>
        <div ref={scrollBottomAnchorRef}></div>
      </main>
    </div>
  );
};

export default App;

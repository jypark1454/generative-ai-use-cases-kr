import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BaseProps } from '../../@types/common';
import DrawerItem, { DrawerItemProps } from '../DrawerItem';
import DrawerBase from '../DrawerBase';
import ExpandableMenu from '../ExpandableMenu';
import useMyUseCases from '../../hooks/useCaseBuilder/useMyUseCases';
import CustomUseCaseDrawerItems from './CustomUseCaseDrawerItems';
import DrawerTabs from '../DrawerTabs';

type Props = BaseProps & {
  items: DrawerItemProps[];
};

const UseCaseBuilderDrawer: React.FC<Props> = (props) => {
  const navigate = useNavigate();

  const { favoriteUseCases, recentlyUsedUseCases } = useMyUseCases();

  const useCases = useMemo(() => {
    const filteredRecentlyUsed = recentlyUsedUseCases.filter(
      (uc) =>
        favoriteUseCases.findIndex((fuc) => fuc.useCaseId === uc.useCaseId) ===
        -1
    );

    return [...favoriteUseCases, ...filteredRecentlyUsed];
  }, [favoriteUseCases, recentlyUsedUseCases]);

  const items = useMemo(() => {
    return props.items;
  }, [props.items]);

  const tabItems = useMemo(() => {
    return [
      {
        label: 'GenU',
        onClick: () => {
          navigate('/');
        },
      },
      {
        label: 'ユースケースビルダー',
        isActive: true,
      },
    ];
  }, [navigate]);

  return (
    <DrawerBase>
      <DrawerTabs items={tabItems} />
      <div className="flex-none">
        <div className="text-aws-smile mx-3 my-2 text-xs">ユースケース管理</div>
        {items.map((item, idx) => (
          <DrawerItem
            key={idx}
            className="mx-2"
            label={item.label}
            icon={item.icon}
            to={item.to}
            sub={item.sub}
          />
        ))}
        <div className="mt-2 border-b" />
      </div>

      <ExpandableMenu title="ユースケース" className="mx-3 my-2 text-xs">
        <div className="scrollbar-thin scrollbar-thumb-white ml-2 mr-1 h-full overflow-y-auto">
          <CustomUseCaseDrawerItems useCases={useCases} />
        </div>
      </ExpandableMenu>
      <div className="border-b" />

      <div className="flex-1"></div>
    </DrawerBase>
  );
};

export default UseCaseBuilderDrawer;

import React, { useMemo } from 'react';
import InputText from '../common/components/InputText';
import useSettings from './useSettings';
import Button from '../common/components/Button';
import { PiCaretLeft } from 'react-icons/pi';
import useAuth from '../common/hooks/useAuth';
import Switch from '../common/components/Switch';

type Props = {
  onBack: () => void;
};

const Settings: React.FC<Props> = (props) => {
  const { settings, setSetting, save } = useSettings();
  const { hasAuthenticated, email, signOut } = useAuth();

  const enabledSamlAuth = useMemo(() => {
    return settings?.enabledSamlAuth ?? false;
  }, [settings?.enabledSamlAuth]);

  return (
    <div className="p-2">
      <div className="text-base font-semibold mb-1">設定</div>
      <div className="font-light text-aws-font-color-gray text-xs">
        <div>확장 기능을 사용하기 위한 설정을 합니다.</div>
        <div>이 확장 기능을 이용하기 위해서는 generative-ai-use-cases-kr을 배포해야 합니다.</div>
      </div>

      <div className="flex flex-col mt-3 gap-2">
        <Switch
          label="SAML 認証を利用する"
          checked={enabledSamlAuth}
          onSwitch={(val) => {
            setSetting('enabledSamlAuth', val);
          }}
        />
        {enabledSamlAuth && (
          <>
            <InputText
              label="Cognit ドメイン（SamlCognitoDomainName）"
              value={settings?.cognitoDomain ?? ''}
              onChange={(val) => {
                setSetting('cognitoDomain', val);
              }}
            />
            <InputText
              label="フェデレーテッドアイデンティティプロバイダー（SamlCognitoFederatedIdentityProviderName）"
              value={settings?.federatedIdentityProviderName ?? ''}
              onChange={(val) => {
                setSetting('federatedIdentityProviderName', val);
              }}
            />
          </>
        )}
        {!enabledSamlAuth && (
          <>
            <InputText
              label="リージョン（Region）"
              value={settings?.region ?? ''}
              onChange={(val) => {
                setSetting('region', val);
              }}
            />
            <InputText
              label="ユーザプールID（UserPoolId）"
              value={settings?.userPoolId ?? ''}
              onChange={(val) => {
                setSetting('userPoolId', val);
              }}
            />
            <InputText
              label="ユーザープールクライアントID（UserPoolClientId）"
              value={settings?.userPoolClientId ?? ''}
              onChange={(val) => {
                setSetting('userPoolClientId', val);
              }}
            />
            <InputText
              label="アイデンティティプールID（IdPoolId）"
              value={settings?.identityPoolId ?? ''}
              onChange={(val) => {
                setSetting('identityPoolId', val);
              }}
            />
            <InputText
              label="推論関数ARN（PredictStreamFunctionArn）"
              value={settings?.lambdaArn ?? ''}
              onChange={(val) => {
                setSetting('lambdaArn', val);
              }}
            />
            <InputText
              label="APIエンドポイント(ApiEndpoint)"
              value={settings?.apiEndpoint ?? ''}
              onChange={(val) => {
                setSetting('apiEndpoint', val);
              }}
            />
          </>
        )}
      </div>
      <div className="flex justify-between">
        <Button className="mt-3" outlined icon={<PiCaretLeft />} onClick={props.onBack}>
          돌아가기
        </Button>
        <Button className="mt-3" onClick={save}>
          설정 저장
        </Button>
      </div>

      <div className="mt-5">
        <div className="text-base font-semibold mb-1">ログイン情報</div>
        <div className="text-aws-font-color-gray">
          {hasAuthenticated ? (
            <div>
              <div>로그인:{email}</div>
              <div className="flex justify-end">
                <Button
                  outlined
                  onClick={() => {
                    signOut();
                  }}
                >
                  로그아웃
                </Button>
              </div>
            </div>
          ) : (
            <div>로그인하지 않았습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

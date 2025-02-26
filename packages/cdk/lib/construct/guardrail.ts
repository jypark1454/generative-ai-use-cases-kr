import { Construct } from 'constructs';
import { aws_bedrock as bedrock } from 'aws-cdk-lib';

export class Guardrail extends Construct {
  public readonly guardrailIdentifier: string;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    const cfnGuardrail = new bedrock.CfnGuardrail(this, `guardrail`, {
      blockedInputMessaging:
        '금지된 입력을 감지했습니다. 대화를 처음부터 다시 시작하거나 관리자에게 문의하세요.',
      blockedOutputsMessaging:
        '금지된 출력을 감지했습니다. 대화를 처음부터 다시 시작하거나 관리자에게 문의하십시오.',
      name: `Guardrail${id}`,
      sensitiveInformationPolicyConfig: {
        // NAME, DRIVER_ID は日本のものが機能しないので設定しない
        // CA_*, US_*, UK_* はそれぞれの国固有のものなので設定しない
        piiEntitiesConfig: [
          { action: 'BLOCK', type: 'AGE' },
          { action: 'BLOCK', type: 'AWS_ACCESS_KEY' },
          { action: 'BLOCK', type: 'AWS_SECRET_KEY' },
          { action: 'BLOCK', type: 'CREDIT_DEBIT_CARD_CVV' },
          { action: 'BLOCK', type: 'CREDIT_DEBIT_CARD_EXPIRY' },
          { action: 'BLOCK', type: 'CREDIT_DEBIT_CARD_NUMBER' },
          { action: 'BLOCK', type: 'EMAIL' },
          { action: 'BLOCK', type: 'INTERNATIONAL_BANK_ACCOUNT_NUMBER' },
          { action: 'BLOCK', type: 'IP_ADDRESS' },
          { action: 'BLOCK', type: 'LICENSE_PLATE' },
          { action: 'BLOCK', type: 'MAC_ADDRESS' },
          { action: 'BLOCK', type: 'PASSWORD' },
          { action: 'BLOCK', type: 'PHONE' },
          { action: 'BLOCK', type: 'PIN' },
          { action: 'BLOCK', type: 'SWIFT_CODE' },
          { action: 'BLOCK', type: 'URL' },
          { action: 'BLOCK', type: 'USERNAME' },
        ],
      },
    });

    this.guardrailIdentifier = cfnGuardrail.attrGuardrailId;
  }
}

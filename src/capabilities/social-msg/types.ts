import type { FunctionStatus } from '@/capabilities/device-functions/types';

export interface SocialMsgData {
  phone: FunctionStatus;
  sms: FunctionStatus;
  wechat: FunctionStatus;
  qq: FunctionStatus;
  facebook: FunctionStatus;
  twitter: FunctionStatus;
  instagram: FunctionStatus;
  linkedin: FunctionStatus;
  whatsapp: FunctionStatus;
  line: FunctionStatus;
  skype: FunctionStatus;
  email: FunctionStatus;
  other: FunctionStatus;
}

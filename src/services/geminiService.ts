import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("YOUR_GEMINI_API_KEY"); // 실제 키가 있다면 넣어주세요.

export const extractPlaceInfo = async (input: string) => {
  return { name: input.split('http')[0].trim() || 'New Entry', category: 'POINT' };
};

export const getQuickTip = async (placeName: string) => {
  return "이곳은 후쿠오카의 숨은 명소예요! 현지인들이 많이 찾는 곳입니다.";
};

export const translateText = async (text: string) => {
  return text; // 번역 로직 테스트용
};

export const getLiveExchangeRate = async (from: string, to: string) => {
  return from === 'JPY' ? 9.2 : 1350;
};
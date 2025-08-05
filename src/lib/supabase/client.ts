import { createBrowserClient } from "@supabase/ssr";

// 브라우저 환경에서 사용할 Supabase 클라이언트
// Client Components에서 사용됩니다.
export function createClientComponentClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// 싱글톤 인스턴스 (선택사항)
export const supabase = createClientComponentClient();

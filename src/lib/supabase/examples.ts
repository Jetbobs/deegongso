// ==========================================
// 🚀 Supabase 클라이언트 사용 예제
// ==========================================

// ==========================================
// 1. Client Component에서 사용하기
// ==========================================
/*
'use client'

import { createClientComponentClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function ClientComponent() {
  const [user, setUser] = useState(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    // 현재 세션 가져오기
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    }

    // 인증 상태 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    getSession()

    return () => subscription.unsubscribe()
  }, [supabase])

  // 로그인
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  // 로그아웃
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  // 데이터 조회
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('your_table')
      .select('*')
    return { data, error }
  }

  return (
    <div>
      {user ? (
        <div>
          <p>안녕하세요, {user.email}님!</p>
          <button onClick={signOut}>로그아웃</button>
        </div>
      ) : (
        <div>
          <p>로그인이 필요합니다</p>
        </div>
      )}
    </div>
  )
}
*/

// ==========================================
// 2. Server Component에서 사용하기
// ==========================================
/*
import { createServerComponentClient } from '@/lib/supabase/server'

export default async function ServerComponent() {
  const supabase = await createServerComponentClient()

  // 현재 사용자 가져오기
  const { data: { user } } = await supabase.auth.getUser()

  // 데이터 조회 (RLS 정책 적용됨)
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching posts:', error)
    return <div>데이터를 불러올 수 없습니다</div>
  }

  return (
    <div>
      <h1>서버에서 렌더링된 포스트 목록</h1>
      {user && <p>사용자: {user.email}</p>}
      <ul>
        {posts?.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  )
}
*/

// ==========================================
// 3. API Route Handler에서 사용하기
// ==========================================
/*
// app/api/posts/route.ts
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createRouteHandlerClient()
    
    // 현재 사용자 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    // 데이터 조회
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ posts })
  } catch (error) {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createRouteHandlerClient()
    const { title, content } = await request.json()
    
    // 현재 사용자 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    // 데이터 삽입
    const { data: post, error } = await supabase
      .from('posts')
      .insert([{ title, content, user_id: user.id }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
*/

// ==========================================
// 4. Server Action에서 사용하기
// ==========================================
/*
// app/actions/posts.ts
'use server'

import { createServerComponentClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  const supabase = await createServerComponentClient()
  
  // 현재 사용자 확인
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const title = formData.get('title') as string
  const content = formData.get('content') as string

  const { error } = await supabase
    .from('posts')
    .insert([{ title, content, user_id: user.id }])

  if (error) {
    throw new Error('포스트 생성에 실패했습니다')
  }

  revalidatePath('/posts')
  redirect('/posts')
}

export async function deletePost(id: string) {
  const supabase = await createServerComponentClient()
  
  // 현재 사용자 확인
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) // 본인 포스트만 삭제 가능

  if (error) {
    throw new Error('포스트 삭제에 실패했습니다')
  }

  revalidatePath('/posts')
}
*/

// ==========================================
// 5. 실시간 기능 사용하기
// ==========================================
/*
'use client'

import { createClientComponentClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function RealtimeComponent() {
  const [posts, setPosts] = useState([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    // 초기 데이터 로드
    const fetchPosts = async () => {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
      
      setPosts(data || [])
    }

    fetchPosts()

    // 실시간 구독 설정
    const channel = supabase
      .channel('posts')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts'
      }, (payload) => {
        console.log('실시간 변경:', payload)
        fetchPosts() // 실제로는 더 효율적인 상태 업데이트 로직 사용
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div>
      <h2>실시간 포스트 목록</h2>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  )
}
*/

export {}; // 모듈로 만들기 위한 export

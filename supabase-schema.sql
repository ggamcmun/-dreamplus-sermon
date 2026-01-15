-- =====================================================
-- 설교노트 주보 앱 - Supabase SQL 스키마
-- =====================================================
-- 이 SQL을 Supabase Dashboard > SQL Editor에서 실행하세요

-- 1. 테이블 생성
-- =====================================================

-- profiles 테이블 (사용자 프로필 및 역할)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- sermons 테이블 (설교)
CREATE TABLE IF NOT EXISTS sermons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  preacher TEXT,
  description TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- sections 테이블 (설교 구간/대지)
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sermon_id UUID NOT NULL REFERENCES sermons(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  key_verses TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- notes 테이블 (성도 개인 메모)
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section_id, user_id)
);

-- 2. 인덱스 생성
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_sermons_slug ON sermons(slug);
CREATE INDEX IF NOT EXISTS idx_sermons_date ON sermons(date DESC);
CREATE INDEX IF NOT EXISTS idx_sermons_published ON sermons(is_published);
CREATE INDEX IF NOT EXISTS idx_sections_sermon ON sections(sermon_id);
CREATE INDEX IF NOT EXISTS idx_notes_section ON notes(section_id);
CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);

-- 3. RLS (Row Level Security) 활성화
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 생성
-- =====================================================

-- profiles 정책
-- 모든 사용자가 자신의 프로필을 볼 수 있음
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- 모든 사용자가 자신의 프로필을 생성할 수 있음
CREATE POLICY "Users can create own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 모든 사용자가 자신의 프로필을 수정할 수 있음
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- sermons 정책
-- 공개된 설교는 모두가 볼 수 있음
CREATE POLICY "Anyone can view published sermons" ON sermons
  FOR SELECT USING (is_published = true);

-- 관리자는 모든 설교를 볼 수 있음
CREATE POLICY "Admins can view all sermons" ON sermons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 관리자만 설교를 생성할 수 있음
CREATE POLICY "Admins can create sermons" ON sermons
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 관리자만 설교를 수정할 수 있음
CREATE POLICY "Admins can update sermons" ON sermons
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 관리자만 설교를 삭제할 수 있음
CREATE POLICY "Admins can delete sermons" ON sermons
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- sections 정책
-- 공개된 설교의 구간은 모두가 볼 수 있음
CREATE POLICY "Anyone can view sections of published sermons" ON sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sermons 
      WHERE sermons.id = sections.sermon_id 
      AND sermons.is_published = true
    )
  );

-- 관리자는 모든 구간을 볼 수 있음
CREATE POLICY "Admins can view all sections" ON sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 관리자만 구간을 생성할 수 있음
CREATE POLICY "Admins can create sections" ON sections
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 관리자만 구간을 수정할 수 있음
CREATE POLICY "Admins can update sections" ON sections
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 관리자만 구간을 삭제할 수 있음
CREATE POLICY "Admins can delete sections" ON sections
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- notes 정책
-- 사용자는 자신의 메모만 볼 수 있음
CREATE POLICY "Users can view own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

-- 로그인한 사용자는 자신의 메모를 생성할 수 있음
CREATE POLICY "Users can create own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 메모만 수정할 수 있음
CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

-- 사용자는 자신의 메모만 삭제할 수 있음
CREATE POLICY "Users can delete own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- 5. 트리거: updated_at 자동 업데이트
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sermons_updated_at
  BEFORE UPDATE ON sermons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. 첫 번째 관리자 설정 (선택사항)
-- =====================================================
-- 아래 SQL을 수정하여 첫 번째 관리자를 설정하세요
-- Google 로그인 후 auth.users 테이블에서 해당 사용자의 id를 확인한 뒤 실행

-- INSERT INTO profiles (id, role, display_name) 
-- VALUES ('여기에-사용자-UUID-입력', 'admin', '관리자 이름');

-- 또는 이미 있는 프로필의 역할을 admin으로 변경:
-- UPDATE profiles SET role = 'admin' WHERE id = '여기에-사용자-UUID-입력';

-- 7. 샘플 데이터 (테스트용, 선택사항)
-- =====================================================

-- 샘플 설교 데이터
-- INSERT INTO sermons (title, date, preacher, description, is_published, slug)
-- VALUES (
--   '믿음의 사람들',
--   '2025-01-19',
--   '홍길동',
--   '히브리서 11장을 통해 믿음의 본질을 배웁니다',
--   true,
--   '20250119-믿음의-사람들'
-- );

-- 샘플 설교의 구간들 (sermon_id는 위에서 생성된 설교의 ID로 대체)
-- INSERT INTO sections (sermon_id, order_index, title, summary, key_verses)
-- VALUES
--   ('설교-UUID', 0, '1. 믿음이란 무엇인가', '믿음은 바라는 것들의 실상이요 보이지 않는 것들의 증거입니다.', '히브리서 11:1'),
--   ('설교-UUID', 1, '2. 아벨의 믿음', '아벨은 믿음으로 더 나은 제사를 드렸습니다.', '히브리서 11:4'),
--   ('설교-UUID', 2, '3. 노아의 믿음', '노아는 아직 보이지 않는 일에 경고하심을 받아 방주를 준비했습니다.', '히브리서 11:7');

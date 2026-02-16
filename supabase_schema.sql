-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  semester INTEGER,
  course TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create subjects table
CREATE TABLE subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create subject_data table (comprehensive stats)
CREATE TABLE subject_data (
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE PRIMARY KEY,
  classes_held INTEGER DEFAULT 0,
  classes_attended INTEGER DEFAULT 0,
  attendance_required INTEGER DEFAULT 75,
  internal_marks DECIMAL DEFAULT 0,
  max_internal_marks DECIMAL DEFAULT 100,
  passing_marks DECIMAL DEFAULT 40,
  exam_weightage DECIMAL DEFAULT 60,
  weekly_study_hours DECIMAL DEFAULT 0,
  assignment_completion DECIMAL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_data ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only view/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Subjects: Users can only view/edit their own subjects
CREATE POLICY "Users can view own subjects" ON subjects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subjects" ON subjects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subjects" ON subjects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own subjects" ON subjects FOR DELETE USING (auth.uid() = user_id);

-- Subject Data: Users can only view/edit data for their own subjects
CREATE POLICY "Users can view own subject data" ON subject_data FOR SELECT 
USING (EXISTS (SELECT 1 FROM subjects WHERE subjects.id = subject_data.subject_id AND subjects.user_id = auth.uid()));

CREATE POLICY "Users can insert own subject data" ON subject_data FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM subjects WHERE subjects.id = subject_data.subject_id AND subjects.user_id = auth.uid()));

CREATE POLICY "Users can update own subject data" ON subject_data FOR UPDATE 
USING (EXISTS (SELECT 1 FROM subjects WHERE subjects.id = subject_data.subject_id AND subjects.user_id = auth.uid()));

CREATE POLICY "Users can delete own subject data" ON subject_data FOR DELETE 
USING (EXISTS (SELECT 1 FROM subjects WHERE subjects.id = subject_data.subject_id AND subjects.user_id = auth.uid()));

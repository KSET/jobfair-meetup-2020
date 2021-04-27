/* eslint-disable camelcase */
export interface ImageVariant {
  url: string;
  width: number;
  height: number;
}

export interface Image {
  original: ImageVariant;
  large: ImageVariant;
  medium: ImageVariant;
  small: ImageVariant;
}

export interface Industry {
  id: string;
  name: string;
}

export interface Company {
  id: string;
  name: string;
  brand_name: string;
  short_description: string;
  homepage_url: string;
  address: string;
  logo: Image | null;
  cover: Image | null;
  industry: Industry;
}

export interface BasicUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  role: string;
  companies: Company[];
  resume: {
    uid: string;
  }
}

export interface Presentation {
  id: string;
  description: string;
  occures_at: string;
  location: string | null;
  title: string;
  topic: string | null;
  presenter_bio: string;
  presenterPhoto: Image | null;
}

export interface Workshop {
  id: string;
  approved: boolean;
  name: string;
  description: string;
  occures_at: string;
  location: string | null;
}

export interface ResumeAward {
  title: string;
  year: string;
}

export interface ResumeEducation {
  name: string;
  year: string;
  module: string;
  awarded_title: string;
}

export interface ResumeLanguage {
  name: string;
  skill_level:
    "A1" |
    "A2" |
    "B1" |
    "B2" |
    "C1" |
    "C2";
}

export interface ResumeSkill {
  name: string;
}

export interface ResumeComputerSkill {
  name: string;
}

export interface ResumeWorkExperience {
  company: string;
  years: string;
  description: string;
  current_employer: boolean;
}

export interface BasicResume {
  id: string;
  user_id: string;
  uid: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface ResumeSections {
  educations: ResumeEducation[];
  work_experiences: ResumeWorkExperience[];
  computer_skills: ResumeComputerSkill[];
  skills: ResumeSkill[];
  languages: ResumeLanguage[];
  awards: ResumeAward[];
}

export interface ResumeInfo extends BasicResume {
  city: string;
  birthday: string;
  phone: string;
  github_url: string;
  linkedin_url: string;
  resume_file_data: string;
}

export type Resume = ResumeInfo & Partial<ResumeSections>;

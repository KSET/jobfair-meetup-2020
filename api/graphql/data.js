/* eslint-disable camelcase */

export const basicFields =
  (...keys) =>
    Object.fromEntries(
      keys
        .flat()
        .map(
          (key) =>
            [ key, "required" ]
          ,
        )
      ,
    )
;

export const basicImageVariant = {
  ...basicFields(
    "url",
    "width",
    "height",
  ),
};

export const basicImage = {
  original: basicImageVariant,
  large: basicImageVariant,
  medium: basicImageVariant,
  small: basicImageVariant,
};

export const presentation = {
  ...basicFields(
    "id",
  ),
};

export const industry = {
  ...basicFields(
    "id",
    "name",
  ),
};

export const companyData = {
  ...basicFields(
    "id",
    "name",
    "brand_name",
    "vat_number",
    "short_description",
    "homepage_url",
    "address",
  ),
  logo: basicImage,
  cover: basicImage,
  industry,
};

export const basicUserData = {
  ...basicFields(
    "id",
    "email",
    "name",
    "role",
  ),
};

export const userData = {
  ...basicFields(
    "id",
    "email",
    "first_name",
    "last_name",
    "name",
    "role",
  ),
  companies: companyData,
};

export const tokenData = {
  ...basicFields(
    "token",
  ),
  user: userData,
};

export const loginData = {
  ...basicFields(
    "refresh_token",
  ),
  ...tokenData,
};

export const presentationData = {
  ...basicFields(
    "id",
    "description",
    "occures_at",
    "location",
    "title",
    "topic",
    "presenter_bio",
  ),
  presenter_photo: basicImage,
};

export const workshopData = {
  ...basicFields(
    "id",
    "description",
    "occures_at",
    "location",
    "name",
  ),
};

export const basicResumeData = {
  ...basicFields(
    "id",
    "full_name",
    "email",
  ),
};

export const resumeEducationData = {
  ...basicFields(
    "name",
    "year",
    "module",
    "awarded_title",
  ),
};

export const resumeLanguageData = {
  ...basicFields(
    "name",
    "skill_level",
  ),
};

export const resumeWorkExperiencesData = {
  ...basicFields(
    "company",
    "years",
    "description",
    "current_employer",
  ),
};

export const resumeComputerSkillData = {
  ...basicFields(
    "name",
  ),
};

export const resumeSkillData = {
  ...basicFields(
    "name",
  ),
};

export const resumeAwardData = {
  ...basicFields(
    "title",
    "year",
  ),
};

export const resumeData = {
  ...basicResumeData,
  ...basicFields(
    "city",
    "birthday",
    "phone",
    "github_url",
    "linkedin_url",
    "resume_file_data",
  ),
  educations: resumeEducationData,
  work_experiences: resumeWorkExperiencesData,
  computer_skills: resumeComputerSkillData,
  skills: resumeSkillData,
  languages: resumeLanguageData,
  awards: resumeAwardData,
};

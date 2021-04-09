import {
  dotGet,
} from "../../../helpers/data";
import {
 sendCsv,
} from "../../helpers/csv";
import {
  fixResume,
} from "../resumes";
import {
  resumesFullDataQuery,
} from "../../graphql/queries";
import {
  graphQlQuery,
} from "../../helpers/axios";
import {
  internalRequest,
} from "../../helpers/http";
import {
  ApiNotFoundError,
  AuthRouter,
} from "../../helpers/route";
import {
  cachedFetcher,
} from "../../helpers/fetchCache";

const authRouter = new AuthRouter({ fullUserData: true });

const cacheForMs = 2 * 1000;

const gdprDate = new Date("2018-05-25T00:00:00Z");
const afterGdpr =
  ({ updatedAt }) =>
    new Date(updatedAt) >= gdprDate
;

const fetchAllResumes = cachedFetcher(
  cacheForMs,
  async (authHeader) => {
    const { resumes } = await graphQlQuery(resumesFullDataQuery(), authHeader);

    if (!resumes) {
      return [];
    }

    return resumes.map(fixResume).filter(afterGdpr);
  },
);

const csvResumesExport = (res, data, fileName = "Svi") => {
  const headers = [
    "First name",
    "Last name",
    "City",
    "Phone",
    "Email",
    "Birthday",
    "Latest education",
    "Latest education year",
    "Education",
    "Work experience",
    "Computer skills",
    "Skills",
    "Languages",
    "Awards",
  ];
  const rows = data.map((row) => {
    const latestEducation = row.educations.sort((a, b) => Number(a.year) - Number(b.year)).pop();

    return [
      row.firstName,
      row.lastName,
      row.city,
      row.phone,
      row.email,
      row.birthday,
      dotGet(latestEducation, "name"),
      dotGet(latestEducation, "year"),
      row.educations.map(({ name, year, module: mod }) => `${ name }, ${ mod }, (${ year })`).join("; "),
      row.workExperiences.map(({ company, years, description }) => `${ company } (${ years }) - ${ description }`).join("; "),
      row.computerSkills.join("; "),
      row.skills.join("; "),
      row.languages.map(({ name, skillLevel }) => `${ name } (${ skillLevel })`).join("; "),
      row.awards.map(({ title, year }) => `${ title } (${ year })`).join("; "),
    ].map((val) => val || "");
  });

  const addZero = (n) => 9 >= n ? `0${ n }` : `${ n }`;
  const now = new Date();
  const datePart = [ now.getFullYear(), now.getMonth() + 1, now.getDate() ].map(addZero).join("-");
  const timePart = [ now.getHours(), now.getMinutes(), now.getSeconds() ].map(addZero).join("-");

  sendCsv(
    res,
    {
      fileName: `Job Fair CV - ${ fileName } @ ${ datePart } ${ timePart }.csv`,
      headers,
      rows,
    },
  );
};

authRouter.use((req, res, next) => {
  const { authUser } = req;

  if (!authUser.companies.length) {
    throw new ApiNotFoundError();
  }

  const [ company ] = authUser.companies;
  req.company = company;

  return next();
});

authRouter.getRaw("/all.csv", cachedFetcher(cacheForMs, async ({ authHeader }, res) => {
  const resumes = await fetchAllResumes(authHeader);

  return csvResumesExport(res, resumes, "Svi");
}));

authRouter.getRaw("/favourites.csv", cachedFetcher(cacheForMs, async ({ authHeader }, res) => {
  const resumes = await fetchAllResumes(authHeader);
  const { data: favouriteIds } = await internalRequest("get", "/resumes/favourites/list", {
    headers: {
      Authorization: authHeader,
    },
  });

  const favourites = Object.fromEntries(favouriteIds.map((id) => [ id, id ]));

  const filteredResumes = resumes.filter(({ id }) => id in favourites);

  return csvResumesExport(res, filteredResumes, "Favoriti");
}));

authRouter.getRaw("/scanned.csv", cachedFetcher(cacheForMs, async ({ authHeader }, res) => {
  const resumes = await fetchAllResumes(authHeader);
  const { data: scannedIds } = await internalRequest("get", "/resumes/scans/list", {
    headers: {
      Authorization: authHeader,
    },
  });

  const scanned = Object.fromEntries(scannedIds.map((id) => [ id, id ]));

  const filteredResumes = resumes.filter(({ id }) => id in scanned);

  return csvResumesExport(res, filteredResumes, "Skenirani");
}));

export default authRouter;

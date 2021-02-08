import {
 generateInsertQuery,
} from "../query";

export const table = "company_applications";

export const queryCompanyApplicationCreate =
  ({
     oib,
     legalName,
     brandName,
     address,
     industryId,
     description,
     website,
     logoImageId,
     vectorLogoFileId,
     talkId,
     workshopId,
     panelInterested,
   }) =>
    generateInsertQuery({
      table,
      data: {
        oib,
        legalName,
        brandName,
        address,
        industryId,
        description,
        website,
        logoImageId,
        vectorLogoFileId,
        talkId,
        workshopId,
        panelInterested,
      },
    })
;

export const queryCompanyApplicationGetByVat =
  ({
     vat,
   }) => ({
    text: `
      select
        *
      from
        company_applications
      where
        "oib" = $1
    `,
    values: [
      vat,
    ],
  })
;

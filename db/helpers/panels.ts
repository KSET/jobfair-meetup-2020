import type {
 CamelCasedPropertiesDeep,
} from "type-fest";
import type {
  User,
} from "../../api/graphql/types";
import {
  generateInsertQuery,
  generateUpdateQuery,
} from "../../db/query";
import type {
  Query,
} from "../methods";
import {
  Image,
} from "./image";

/* eslint-disable camelcase */

export interface PanelCompany {
  companyId: string;
  aboutPanelist: string;
  uploaderId: User["id"];
  imageId?: Image["id"];
}

export interface Panel {
  id: number;
  title: string;
  description: string;
  occures_at: string;
  companies: PanelCompany[];
  created_at: string;
  updated_at: string;
}

export type PanelData = Omit<CamelCasedPropertiesDeep<Panel>, "createdAt" | "updatedAt" | "id">

/* eslint-enable camelcase */

export const queryPanelsGetAll =
  (): Query => ({
    text: `
      select
        *
      from
        panels
      order by
        occures_at
    `,
  })
;

export const queryPanelsGetById =
  (
    {
      id,
    }: Pick<Panel, "id">,
  ): Query => ({
    text: `
      select
        *
      from
        panels
      where
        "id" = $1
    `,
    values: [
      id,
    ],
  })
;

export const queryPanelsDeleteById =
  (
    {
      id,
    }: Pick<Panel, "id">,
  ): Query => ({
    text: `
      delete from
        panels
      where
        "id" = $1
      returning id
    `,
    values: [
      id,
    ],
  })
;

export const queryPanelsCreate =
  (
    {
      title,
      description,
      occuresAt,
      companies,
    }: PanelData,
  ): Query => generateInsertQuery({
    table: "panels",
    data: {
      title,
      description,
      occuresAt,
      companies: JSON.stringify(companies),
    },
  })
;

export const queryPanelsUpdateById =
  (
    id: Panel["id"],
    {
      title,
      description,
      occuresAt,
      companies,
    }: Partial<PanelData>,
  ): Query => generateUpdateQuery(
    {
      table: "panels",
      data: {
        title,
        description,
        occuresAt,
        companies: JSON.stringify(companies),
        updatedAt: new Date(),
      },
      where: {
        id,
      },
    },
  )
;

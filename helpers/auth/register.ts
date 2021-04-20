import {
  email,
  maxLength,
  minLength,
  required,
  sameAs,
} from "vuelidate/lib/validators";

import {
  constant,
} from "lodash/fp";

type ValidatorFn = ((val: unknown) => boolean) | ((val: unknown, context: unknown) => boolean)

interface FormSkeletonEntry {
  value: string;
  label: {
    text: string;
    placeholder: string;
  };
  validations: Record<string, ValidatorFn>;
  type?:
    "button"
    | "checkbox"
    | "color"
    | "date"
    | "datetime-local"
    | "email"
    | "file"
    | "hidden"
    | "image"
    | "month"
    | "number"
    | "password"
    | "radio"
    | "range"
    | "reset"
    | "search"
    | "submit"
    | "tel"
    | "text"
    | "time"
    | "url"
    | "week";
}

interface FormSkeleton {
  [name: string]: FormSkeletonEntry;
}

const getFormType: <T>(type: keyof FormSkeletonEntry, form: FormSkeleton) => Record<keyof FormSkeleton, T> =
  (type, form) =>
    Object
      .fromEntries(
        Object
          .entries(form)
          .map(([ key, { [type]: value } ]) => [ key, value as any ]),
      )
;

export const registerForm: () => FormSkeleton = constant({
  email: {
    value: "",
    label: {
      text: "E-mail",
      placeholder: "marko.horvat@fer.hr",
    },
    validations: {
      required,
      email,
    },
    type: "email",
  },
  name: {
    value: "",
    label: {
      text: "Ime",
      placeholder: "Marko Horvat",
    },
    validations: {
      required,
    },
  },
  phone: {
    value: "",
    label: {
      text: "Kontakt telefon",
      placeholder: "+385 99 681 0011",
    },
    validations: {
      required,
    },
    type: "tel",
  },
  password: {
    value: "",
    label: {
      text: "Lozinka",
      placeholder: "Lozinka (min. 10 znakova)",
    },
    validations: {
      required,
      minLength: minLength(10),
      maxLength: maxLength(255),
    },
    type: "password",
  },
  passwordRepeat: {
    value: "",
    label: {
      text: "Potvrda lozinke",
      placeholder: "Opet ista lozinka",
    },
    validations: {
      required,
      sameAsPassword: sameAs("password"),
    },
    type: "password",
  },
});

export const registerFormInputs =
  (): Record<string, FormSkeletonEntry["value"]> =>
    getFormType(
      "value",
      registerForm(),
    )
;

export const registerFormValidations =
  (): Record<string, FormSkeletonEntry["validations"]> =>
    getFormType(
      "validations",
      registerForm(),
    )
;

export const registerFormLabels =
  (): Record<string, FormSkeletonEntry["label"]> =>
    getFormType(
      "label",
      registerForm(),
    )
;

export const registerFormTypes =
  (): Record<string, FormSkeletonEntry["type"]> =>
    getFormType(
      "type",
      registerForm(),
    )
;

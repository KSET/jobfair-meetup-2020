import {
  email,
  helpers,
  maxLength,
  minLength,
  required,
  url,
} from "vuelidate/lib/validators";
import {
  MAX_IMAGE_SIZE__B,
} from "./image";
import {
  TOPICS as TALK_TOPICS,
} from "./talk";

const maxFileSize =
  (param) =>
    helpers.withParams(
      {
        type: "maxFileSize",
        size: param,
      },
      (value) =>
        !helpers.req(value) ||
        param > value.size
      ,
    )
;

const getFormType =
  (type, form) =>
    Object
      .fromEntries(
        Object
          .entries(form)
          .map(([ key, { [type]: value } ]) => [ key, value ]),
      )
;

export const companyForm = () => ({
  legalName: {
    value: "",
    label: "Pravni naziv tvrtke",
    validations: {
      required,
    },
  },
  brandName: {
    value: "",
    label: "Prikazani naziv tvrtke",
    validations: {
      required,
    },
  },
  contactEmail: {
    value: "",
    label: "Email kontakt osobe",
    validations: {
      required,
      email,
    },
  },
  contactName: {
    value: "",
    label: "Ime kontakt osobe",
    validations: {
      required,
    },
  },
  contactPhone: {
    value: "",
    label: "Broj telefona kontakt osobe",
    validations: {
      required,
    },
  },
  address: {
    value: "",
    label: "Adresa",
    validations: {
      required,
    },
  },
  industryId: {
    value: 0,
    label: "Industrija",
    validations: {
      required,
    },
  },
  description: {
    value: "",
    label: "Opis tvrtke",
    validations: {
      required,
      minLength: minLength(100),
      maxLength: maxLength(365),
    },
  },
  homepageUrl: {
    value: "",
    label: "Adresa web stranice",
    validations: {
      required,
      url,
    },
  },
  logo: {
    value: null,
    label: "Logo",
    validations: {
      required,
      maxFileSize: maxFileSize(MAX_IMAGE_SIZE__B),
    },
  },
  vectorLogo: {
    value: null,
    label: "Vektorski logo",
    validations: {
      required,
    },
  },
});

export const companyExtrasForm = () => ({
  talk: {
    chosen: false,

    form: {
      title: {
        value: "",
        label: "Naslov talka",
        validations: {
          required,
        },
      },
      description: {
        value: "",
        label: "Opis talka",
        validations: {
          required,
        },
      },
      topic: {
        value: TALK_TOPICS[0].value,
        label: "Tema talka",
        validations: {
          required,
        },
      },
      image: {
        value: null,
        label: "Fotografija predavača",
        validations: {
          required,
        },
      },
      biography: {
        value: "",
        label: "Kratka biografija predavača",
        validations: {
          required,
        },
      },
    },
  },

  workshop: {
    chosen: false,

    form: {
      title: {
        value: "",
        label: "Naslov radionice",
        validations: {
          required,
        },
      },
      description: {
        value: "",
        label: "Opis radionice",
        validations: {
          required,
        },
      },
      goal: {
        value: "",
        label: "Cilj radionice",
        validations: {
          required,
        },
      },
      biography: {
        value: "",
        label: "Kratka biografija voditelja radionice",
        validations: {
          required,
        },
      },
      notes: {
        value: "",
        label: "Dodatne napomene (opcionalno)",
        validations: {},
      },
    },
  },

  panel: {
    chosen: false,

    form: {
      chosen: {
        value: true,
        label: "Zainteresirani smo za potencijalno sudjelovanje na jednom od panela",
        validations: {},
      },
    },
  },
});

export const companyFormInputs =
  () =>
    getFormType(
      "value",
      companyForm(),
    )
;

export const companyFormValidations =
  () =>
    getFormType(
      "validations",
      companyForm(),
    )
;

export const companyFormLabels =
  () =>
    getFormType(
      "label",
      companyForm(),
    )
;

export const companyExtrasFormInputs =
  () =>
    Object
      .fromEntries(
        Object
          .entries(companyExtrasForm())
          .map(([ category, { form, ...rest } ]) => [ category, { ...rest, form: getFormType("value", form) } ])
        ,
      )
;

export const companyExtrasFormValidations =
  () =>
    Object
      .fromEntries(
        Object
          .entries(companyExtrasForm())
          .map(([ category, { form } ]) => [ category, { form: getFormType("validations", form) } ])
        ,
      )
;

export const companyExtrasFormLabels =
  () =>
    Object
      .fromEntries(
        Object
          .entries(companyExtrasForm())
          .map(([ category, { form } ]) => [ category, getFormType("label", form) ])
        ,
      )
;

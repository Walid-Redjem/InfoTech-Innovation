/**
 * Tests for Join Us form validation rules.
 * These mirror the validate() function in app/[locale]/join/page.tsx
 */

type Profile = "youth" | "teacher" | "institution";

function validate(
  selected: Profile,
  form: Record<string, string>,
  fileUrls: Record<string, string>,
  isUnderage: boolean,
  isAdult: boolean
): Record<string, boolean> {
  const errors: Record<string, boolean> = {};

  if (selected === "youth") {
    if (!form.name?.trim()) errors.name = true;
    if (!form.email?.trim()) errors.email = true;
    if (!form.phone?.trim()) errors.phone = true;
    if (!form.age?.trim()) errors.age = true;
    if (!form.contribution) errors.contribution = true;
    if (!fileUrls.birth_certificate) errors.birth_certificate = true;
    if (isUnderage && !fileUrls.underage_form) errors.underage_form = true;
    if (isAdult && !fileUrls.adult_form) errors.adult_form = true;
  }

  if (selected === "teacher") {
    if (!form.name?.trim()) errors.name = true;
    if (!form.email?.trim()) errors.email = true;
    if (!form.phone?.trim()) errors.phone = true;
    if (!form.institution_name?.trim()) errors.institution_name = true;
    if (!form.specialty?.trim()) errors.specialty = true;
    if (!form.contribution) errors.contribution = true;
    if (!fileUrls.birth_certificate) errors.birth_certificate = true;
    if (!fileUrls.resume) errors.resume = true;
    if (!fileUrls.selfie) errors.selfie = true;
    if (!fileUrls.degree) errors.degree = true;
  }

  if (selected === "institution") {
    if (!form.institution_name?.trim()) errors.institution_name = true;
    if (!form.contact_person?.trim()) errors.contact_person = true;
    if (!form.email?.trim()) errors.email = true;
    if (!form.phone?.trim()) errors.phone = true;
    if (!form.partnership) errors.partnership = true;
  }

  return errors;
}

const fullYouth = {
  name: "Walid", email: "w@test.com", phone: "0770000000",
  age: "20", contribution: "volunteer",
};
const fullFiles = {
  birth_certificate: "https://cdn.example.com/cert.pdf",
  adult_form: "https://cdn.example.com/form.pdf",
};

describe("Youth form validation", () => {
  it("passes with all required fields", () => {
    const errors = validate("youth", fullYouth, fullFiles, false, true);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it("fails when name is missing", () => {
    const errors = validate("youth", { ...fullYouth, name: "" }, fullFiles, false, true);
    expect(errors.name).toBe(true);
  });

  it("fails when email is missing", () => {
    const errors = validate("youth", { ...fullYouth, email: "" }, fullFiles, false, true);
    expect(errors.email).toBe(true);
  });

  it("fails when phone is missing", () => {
    const errors = validate("youth", { ...fullYouth, phone: "" }, fullFiles, false, true);
    expect(errors.phone).toBe(true);
  });

  it("fails when birth certificate is missing", () => {
    const errors = validate("youth", fullYouth, { adult_form: fullFiles.adult_form }, false, true);
    expect(errors.birth_certificate).toBe(true);
  });

  it("requires underage_form when age < 17", () => {
    const errors = validate(
      "youth",
      { ...fullYouth, age: "14" },
      { birth_certificate: fullFiles.birth_certificate },
      true, false
    );
    expect(errors.underage_form).toBe(true);
  });

  it("requires adult_form when age >= 17", () => {
    const errors = validate(
      "youth",
      fullYouth,
      { birth_certificate: fullFiles.birth_certificate },
      false, true
    );
    expect(errors.adult_form).toBe(true);
  });

  it("does not require adult_form for underage", () => {
    const errors = validate(
      "youth",
      { ...fullYouth, age: "12" },
      { birth_certificate: fullFiles.birth_certificate, underage_form: "url" },
      true, false
    );
    expect(errors.adult_form).toBeUndefined();
  });
});

describe("Teacher form validation", () => {
  const fullTeacher = {
    name: "Sara", email: "s@test.com", phone: "0770000001",
    institution_name: "Lycée Moderne", specialty: "Math", contribution: "mentor",
  };
  const teacherFiles = {
    birth_certificate: "url1", resume: "url2", selfie: "url3", degree: "url4",
  };

  it("passes with all required fields", () => {
    const errors = validate("teacher", fullTeacher, teacherFiles, false, false);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it("fails when any document is missing", () => {
    const { resume: _, ...noResume } = teacherFiles;
    const errors = validate("teacher", fullTeacher, noResume, false, false);
    expect(errors.resume).toBe(true);
  });

  it("fails when specialty is missing", () => {
    const errors = validate("teacher", { ...fullTeacher, specialty: "" }, teacherFiles, false, false);
    expect(errors.specialty).toBe(true);
  });
});

describe("Institution form validation", () => {
  const fullInstitution = {
    institution_name: "Org X", contact_person: "Ali",
    email: "ali@org.com", phone: "0770000002", partnership: "financial",
  };

  it("passes with all required fields", () => {
    const errors = validate("institution", fullInstitution, {}, false, false);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it("fails when institution_name is missing", () => {
    const errors = validate("institution", { ...fullInstitution, institution_name: "" }, {}, false, false);
    expect(errors.institution_name).toBe(true);
  });

  it("fails when partnership type is missing", () => {
    const errors = validate("institution", { ...fullInstitution, partnership: "" }, {}, false, false);
    expect(errors.partnership).toBe(true);
  });

  it("does not require birth_certificate or files", () => {
    const errors = validate("institution", fullInstitution, {}, false, false);
    expect(errors.birth_certificate).toBeUndefined();
    expect(errors.resume).toBeUndefined();
  });
});

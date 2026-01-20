export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const isValidName = (name) => {
  return name.trim().length >= 2 && name.trim().length <= 50;
};

export const isRequired = (value) => {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return value != null;
};

export const validateForm = (data, rules) => {
  const errors = {};
  let isValid = true;

  Object.entries(rules).forEach(([field, fieldRules]) => {
    const value = data[field];
    const fieldErrors = [];

    fieldRules.forEach((rule) => {
      switch (rule.type) {
        case "required":
          if (!isRequired(value)) {
            fieldErrors.push(rule.message || `${field} is required`);
          }
          break;
        case "email":
          if (value && !isValidEmail(value)) {
            fieldErrors.push(rule.message || "Invalid email format");
          }
          break;
        case "password":
          if (value) {
            const passwordValidation = validatePassword(value);
            if (!passwordValidation.isValid) {
              fieldErrors.push(...passwordValidation.errors);
            }
          }
          break;
        case "name":
          if (value && !isValidName(value)) {
            fieldErrors.push(rule.message || "Name must be 2-50 characters");
          }
          break;
        case "minLength":
          if (value && value.length < rule.value) {
            fieldErrors.push(rule.message || `Minimum length is ${rule.value}`);
          }
          break;
        case "maxLength":
          if (value && value.length > rule.value) {
            fieldErrors.push(rule.message || `Maximum length is ${rule.value}`);
          }
          break;
      }
    });

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
      isValid = false;
    }
  });

  return { isValid, errors };
};

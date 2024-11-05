import Joi from 'joi';
import { typeList } from '../constants/contacts.js';

export const contactAddSchema = Joi.object({
  name: Joi.string().min(3).max(20).required().messages({
    'string.min': 'Ім’я повинно містити щонайменше 3 символи',
    'string.max': 'Ім’я не може перевищувати 20 символів',
    'any.required': 'Ім’я обов’язкове для заповнення',
  }),
  phoneNumber: Joi.string().min(3).max(20).required().messages({
    'string.min': 'Номер телефону повинен містити щонайменше 3 символи',
    'string.max': 'Номер телефону не може перевищувати 20 символів',
    'any.required': 'Номер телефону обов’язковий для заповнення',
  }),
  email: Joi.string().email().messages({
    'string.email': 'Некоректний формат електронної пошти',
  }),
  isFavourite: Joi.boolean(),
  contactType: Joi.string()
    .valid(...typeList)
    .required()
    .messages({
      'any.required': 'Тип контакту обов’язковий для заповнення',
      'any.only': `Тип контакту повинен бути одним з наступних: ${typeList.join(
        ', ',
      )}`,
    }),
});

export const contactUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(20).messages({
    'string.min': 'Ім’я повинно містити щонайменше 3 символи',
    'string.max': 'Ім’я не може перевищувати 20 символів',
  }),
  phoneNumber: Joi.string().min(3).max(20).messages({
    'string.min': 'Номер телефону повинен містити щонайменше 3 символи',
    'string.max': 'Номер телефону не може перевищувати 20 символів',
  }),
  email: Joi.string().email().messages({
    'string.email': 'Некоректний формат електронної пошти',
  }),
  isFavourite: Joi.boolean(),
  contactType: Joi.string()
    .valid(...typeList)
    .messages({
      'any.only': `Тип контакту повинен бути одним з наступних: ${typeList.join(
        ', ',
      )}`,
    }),
}).min(1);

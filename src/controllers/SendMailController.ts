/* eslint-disable camelcase */
import { resolve } from 'path'
import { Request, Response } from 'express'
import { getCustomRepository } from 'typeorm'
import { SurveysRepository } from '../repositories/SurveysRepository'
import { SurveyUserRepository } from '../repositories/SurveyUserRepository'
import { UsersRepository } from '../repositories/UsersRepository'
import SendMailServices from '../services/SendMailServices'
import { AppError } from '../errors/AppError'
import * as yup from 'yup'

class SendMailController {
  async execute(request: Request, response: Response) {
    const { email, survey_id } = request.body

    const schema = yup.object().shape({
      email: yup.string().email().required(),
      survey_id: yup.string().uuid().required()
    })

    try {
      await schema.validate(request.body, { abortEarly: false })
    } catch (err) {
      throw new AppError(err)
    }

    const usersRepository = getCustomRepository(UsersRepository)
    const surveysRepository = getCustomRepository(SurveysRepository)
    const surveysUsersRepository = getCustomRepository(SurveyUserRepository)

    const user = await usersRepository.findOne({ email })
    if (!user) {
      throw new AppError('User does not exists!')
    }

    const survey = await surveysRepository.findOne({
      id: survey_id
    })
    if (!survey) {
      throw new AppError('Survey does not exists!')
    }

    const npsPath = resolve(__dirname, '..', 'views', 'emails', 'npsMail.hbs')

    const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
      where: { users_id: user.id, value: null },
      relations: ['user', 'survey']
    })

    const variables = {
      id: '',
      name: user.name,
      title: survey.title,
      description: survey.description,
      link: process.env.URL_MAIL
    }

    if (surveyUserAlreadyExists) {
      variables.id = surveyUserAlreadyExists.id
      await SendMailServices.execute(email, survey.title, variables, npsPath)
      return response.json(surveyUserAlreadyExists)
    }

    const surveyUser = surveysUsersRepository.create({
      users_id: user.id,
      surveys_id: survey_id
    })
    await surveysUsersRepository.save(surveyUser)

    variables.id = surveyUser.id

    await SendMailServices.execute(email, survey.title, variables, npsPath)

    return response.status(201).send()
  }
}

export { SendMailController }

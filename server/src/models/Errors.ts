import { HttpStatusCode } from '~/constants/enums'
import { userErrorMessages } from '~/constants/messages'

type ErrorType = Record<
  string,
  {
    msg: string
    [key: string]: any // Ngoài những cặp key: value trên thì còn có thể có những cặp key: value khác
  }
> //{[key: string]: string}

export class ErrorWithStatus {
  message: string
  status: number
  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}

export class UnprocessableEntityError extends ErrorWithStatus {
  errors: ErrorType
  constructor({ message = userErrorMessages.VALIDATION_ERROR, errors }: { message?: string; errors: ErrorType }) {
    super({ message, status: HttpStatusCode.UnprocessableEntity })
    this.errors = errors
  }
}

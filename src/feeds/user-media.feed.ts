import { Media } from '../models/media';
import { plainToClass } from 'class-transformer';
import { Request } from '../core';
import { AbstractFeed } from './abstract.feed';
import { Session } from 'src/core/session';

export class UserMediaFeed extends AbstractFeed<Media> {
  constructor(
    session: Session, 
    public accountId: string | number, 
    public config: {
      limit?: number
      excludeComment?: boolean
    } = {}
  ) {
    super(session)

    this.config = Object.assign({
      limit: Infinity,
      excludeComment: false
    }, config)

    this.limit = this.config.limit
  }

  async get(): Promise<Media[]> {
    const data = await new Request(this.session)
      .setMethod('GET')
      .setResource('userFeed', {
        id: this.accountId,
        maxId: this.getCursor(),
        excludeComment: this.config.excludeComment
      })
      .send()

    this.moreAvailable = data.more_available && !!data.next_max_id
    if (this.moreAvailable) {
      this.setCursor(data.next_max_id)
    }
    return plainToClass(Media, data.items)
  }
}

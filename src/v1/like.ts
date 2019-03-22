import { Request } from '../core/request';
import { LikeModuleName } from '../interfaces/like.interface';
import { Session } from 'src/v1';

export class Like {
  static async post(
    action: 'like' | 'unlike' = 'like',
    session: Session,
    mediaId: string | number,
    moduleInfo: LikeModuleName.Type = { module_name: 'feed_timeline' },
    doubleTapToLike: boolean = false
  ) {

    let request =  new Request(session)
      .setMethod('POST')
      .setResource(action, { id: mediaId })
      .generateUUID()
      .setData({
        _uid: await session.getAccountId(),
        media_id: mediaId,
        radio_type: 'wifi-none',
        ...moduleInfo,
      })
      
    if (doubleTapToLike) {
      request = request.setUnsignPostData("d", "1")
    } else {
      request = request.setUnsignPostData("d", "0")
    }

    return request.signPayload().send();
  }
  
  /**
   * Like post  
   * @param session Session instance
   * @param mediaId The media ID in Instagram's internal format (ie "3482384834_43294")
   * @param moduleName From which app module (page) you're performing this action. 
   * Some modules requires extra params.
   * May have following values:
   *   feed_contextual_post 
   *   profile
   *   media_view_profile
   *   video_view_profile
   *   photo_view_profile
   *   feed_contextual_hashtag
   *   feed_contextual_location
   *   feed_timeline
   *   newsfeed
   *   feed_contextual_newsfeed_multi_media_liked
   * Check extra params in LikeModuleName
   * @param doubleTapToLike was it double tapped to like
   */
  static create(
    session: Session, 
    mediaId: string, 
    moduleName: LikeModuleName.Type,
    doubleTapToLike: boolean = false
  ) {
    return this.post('like', session, mediaId, moduleName, doubleTapToLike);
  }

  static destroy(
    session: Session, 
    mediaId: string, 
    moduleName: LikeModuleName.Type
  ) {
    // there ins no double tap to unlike
    return this.post('unlike', session, mediaId, moduleName, false);
  }
}

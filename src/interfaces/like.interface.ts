export namespace LikeModuleName {

  /**
   * feed_timeline - "Timeline" tab (the global Home-feed with all kinds of mixed news)
   * 
   * newsfeed - "Followings Activity" feed tab. Used when liking/unliking a post that 
   *   we clicked on from a single-activity "xyz liked abc's post" entry
   * 
   * feed_contextual_newsfeed_multi_media_liked - "Followings Activity" feed tab. Used when 
   *   liking/unliking a post that we clicked on from a multi-activity "xyz liked 5 posts" entry
   */
  export interface FeedTimeline {
    module_name: 'feed_timeline' | 'newsfeed' | 'feed_contextual_newsfeed_multi_media_liked';
  }
  
  /**
   * "Explore" tab
   * Requires explore media token value
   */
  export interface FeedContextualPost {
    module_name: 'feed_contextual_post'
    explore_source_token: string
  }
  
  /**
   * "Hashtag" search result
   * Requires hashtag where the app found this media (without #). 
   */
  export interface FeedContextualHashtag {
    module_name: 'feed_contextual_hashtag';
    hashtag: string;
  }
  
  /**
   * "Location" search result
   * Requires location ID 
   */
  export interface FeedContextualLocation {
    module_name: 'feed_contextual_location';
    location_id: string | number;
  }
  
  /**
   * Profile, MediaViewProfile, VideoViewProfile, PhotoViewProfile are requireing
   * username and user_id of profile owner
   */
  interface BaseProfile {
    username: string;
    user_id: string | number;
  }
  
  /**
   * Profile page - list view (when posts are shown vertically by the app
   * one at a time as in the Timeline tab)
   */
  export interface Profile extends BaseProfile {
    module_name: 'profile';
  }
  
  /**
   * MediaViewProfile, VideoViewProfile, PhotoViewProfile - grid view
   * depending on media type you should use:
   *   MediaViewProfile - album (carousel)
   *   VideoViewProfile - video
   *   PhotoViewProfile - photo
   */
  export interface MediaViewProfile extends BaseProfile {
    module_name: 'media_view_profile';
  }

  export interface VideoViewProfile extends BaseProfile {
    module_name: 'video_view_profile';
  }

  export interface PhotoViewProfile extends BaseProfile {
    module_name: 'photo_view_profile';
  }

  export type Type = (
    | FeedTimeline
    | FeedContextualPost
    | FeedContextualHashtag
    | FeedContextualLocation
    | Profile
    | MediaViewProfile
    | VideoViewProfile
    | PhotoViewProfile) & { [x: string]: any; };
}

import React from 'react'
import Style from './storiesAreaLoader.module.css'
import { FaUser } from 'react-icons/fa'

export default function StoriesAreaLoader() {
  return (
    <div className={Style.storyArea}>

        <div className={Style.usersStory}>
            <div className={Style.profileImage}>
                <FaUser />
            </div>
        </div>

        <div className={Style.line}></div>
        
        <div className={Style.usersStory}>
            <div className={Style.profileImage}>
                <FaUser />
            </div>
        </div>

        <div className={Style.usersStory}>
            <div className={Style.profileImage}>
                <FaUser />
            </div>
        </div>

        <div className={Style.usersStory}>
            <div className={Style.profileImage}>
                <FaUser />
            </div>
        </div>

    </div>
  )
}
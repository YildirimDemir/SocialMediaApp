'use client';

import React, { useState } from 'react'
import Style from './usersettings.module.css'
import ChangePassword from './Settings/ChangePassword';

export default function UserSettings() {

    const [selectedSetting, setSelectedSetting] = useState<string>('password');

  return (
    <div className={Style.settingsPage}>
        <div className={Style.settingsSidebar}>
            <button
              className={Style.chooseBtn}
              onClick={() => setSelectedSetting('password')}
            >
                Password
            </button>
        </div>
        <div className={Style.selectedSettingArea}>
            {selectedSetting === 'password' && <ChangePassword />}
        </div>
    </div>
  )
}

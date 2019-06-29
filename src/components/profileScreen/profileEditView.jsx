import React from 'react';
import { Link } from 'react-router-dom';

import Form from '../common/form';
import ProfileEdit from './profileEdit';
import PasswordEdit from './passwordEdit';

import { url } from '../../URL.json';

import './style/profileEditView.css';

class ProfileEditView extends Form {
  render() {
    return (
      <div id="profile_edit_view">
        <Link id="back" to={url.profileScreen}>
          {'< Zurück'}
        </Link>
        <PasswordEdit {...this.props} />
        <hr />
        <ProfileEdit {...this.props} />
      </div>
    );
  }
}

export default ProfileEditView;

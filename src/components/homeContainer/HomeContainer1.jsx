import React from 'react'
import SocialMedia from "../../images/SocialMedia.png";

const HomeContainer1 = () => {
  return (
    <div className="container col-xxl-8 px-3 py-3">
    <div className="row flex-lg-row-reverse align-items-center g-5 py-5 mt-5">
      <div className="col-10 col-sm-8 col-lg-6">
        <img src={SocialMedia} className="d-block mx-lg-auto img-fluid" alt="Bootstrap Themes" width="900" height="700" loading="lazy"/>
      </div>
      <div className="col-lg-6">
        <h1 className="display-5 fw-bold lh-1 mb-3"> Online platform for MSMEs.</h1>
        <p className="lead">Web-based platform designed to streamline and facilitate the approval process for social media content. It offers a centralized interface for teams to submit, review, and approve posts before they are published on various social media platforms. </p>
      </div>
    </div>
  </div>
  )
}

export default HomeContainer1
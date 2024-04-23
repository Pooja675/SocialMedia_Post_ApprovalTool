import React, { useEffect, useState } from "react";
// import styles from "./CreateNewRequest.module.css";
import { auth, db, storage } from "../../firebase.config";
import { setDoc, doc } from "firebase/firestore";
import {
  getDownloadURL,
  getMetadata,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AttachmentList from "./AttachmentList";

const CreateNewRequest1 = () => {
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [contentBody, setContentBody] = useState("");
  const [contentError, setContentError] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [hashtagError, setHashtagError] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState("");
  const [dateTime, setDateTime] = useState(null);
  const [needsGraphicDesigner, setNeedsGraphicDesigner] = useState("No");
  const [requesterComments, setRequesterComments] = useState("");
  const [commentsError, setCommentsError] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [per, setPerc] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fileNames, setFileNames] = useState([]);

  // const removeAttachment = (index) => {
  //   const newAttachments = [...attachments];
  //   newAttachments.splice(index, 1);
  //   setAttachments(newAttachments);
  // };

  const removeAttachment = (index) => {
    setAttachments((attachments) =>
      attachments.filter((attachment, i) => i !== index)
    );
  };

  const removeFileName = (index) => {
    setFileNames((fileNames) => fileNames.filter((fileName, i) => i !== index));
  };

  const uploadFile = (e) => {
    setLoading(true);
    const files = e.target.files;
    const uploadPromises = [];

    // Check if any file is already uploaded or not
  let existingAttachments = attachments;
  let existingFileNames = fileNames;
  if (attachments.length > 0) {
    existingAttachments = [...attachments];
    existingFileNames = [...fileNames];
  }

    for (let i = 0; i < files.length; i++) {
      const imageFile = files[i];
      const storageRef = ref(
        storage,
        `Images/${Date.now()} - ${imageFile.name}`
      );
      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      const promise = new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Progress tracking logic remains the same
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setPerc(progress);
            console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
            }
          },
          (error) => {
            reject(error);
          },
          () => {
            // getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            //   resolve(downloadURL);
            const downloadURL = getDownloadURL(uploadTask.snapshot.ref);
            const name = imageFile.name;
            Promise.all([downloadURL, name]).then(([url, name]) => {
              resolve({ name, url });
            });
          }
        );
      });

      uploadPromises.push(promise);
    }

    Promise.all(uploadPromises)
      .then((attachments) => {
        // Handle all download URLs here
        // setAttachments(downloadURLs); // Assuming you have a state to store attachments as an array
        // setLoading(false);
        // setAttachments(attachments.map((attachment) => attachment.url));
        // setFileNames(attachments.map((attachment) => attachment.name));
         // Append new attachments to existing array if any attachment is already uploaded
      if (existingAttachments.length > 0) {
        setAttachments([...existingAttachments, ...attachments.map((attachment) => attachment.url)]);
        setFileNames([...existingFileNames, ...attachments.map((attachment) => attachment.name)]);
      } else {
        setAttachments(attachments.map((attachment) => attachment.url));
        setFileNames(attachments.map((attachment) => attachment.name));
      }
      setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleTitleChange = (e) => {
    const inputValue = e.target.value;

    if (!inputValue) {
      setTitleError("Title is required.");
      setTitle("");
    } else if (inputValue.length <= 50) {
      setTitle(inputValue);
      setTitleError("");
    } else {
      setTitleError("Title must be less than or equal to 50 characters.");
    }
  };

  const handleContentBodyChange = (e) => {
    const inputValue = e.target.value;

    if (!inputValue) {
      setContentError("Content body is required.");
      setContentBody("");
    } else if (inputValue.length <= 250) {
      setContentBody(inputValue);
      setContentError("");
    } else {
      setContentError(
        "Content body must be less than or equal to 250 characters."
      );
    }
  };

  const handleHashtagsChange = (e) => {
    const inputValue = e.target.value;
    if (!inputValue) {
      setHashtagError("Hashtags are required.");
      setHashtags("");
    } else if (inputValue.length <= 100) {
      setHashtags(inputValue);
      setHashtagError("");
    } else {
      setHashtagError("Hashtags must be less than or equal to 100 characters.");
    }
  };

  const handleCommentsChange = (e) => {
    const inputValue = e.target.value;
    if (!inputValue) {
      setCommentsError("Comments are required.");
      setRequesterComments("");
    } else if (inputValue.length <= 250) {
      setRequesterComments(inputValue);
      setCommentsError("");
    } else {
      setCommentsError(
        "Comments must be less than or equal to 250 characters."
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle form submission logic here
    if (
      !title.trim() ||
      !contentBody.trim() ||
      !hashtags.trim() ||
      !selectedPlatforms.trim() ||
      !dateTime ||
      !needsGraphicDesigner.trim() ||
      !requesterComments.trim()
    ) {
      // Show message on web page

      setFormError("Please fill all the required fields.");
      window.scrollTo(0, 0);

      setTimeout(() => {
        setFormError("");
        // window.scrollTo(0, 0);
      }, 4000);
      return; // Stop further execution
    } else {
      try {
        const saveItem = async (data) => {
          await setDoc(doc(db, "requestData", `${Date.now()}`), data, {
            merge: true,
          });
        };

        const id = `${Date.now()}`;

        // const userEmail = auth.currentUser ? auth.currentUser.email : "";

        const requestData = {
          id: id,
          title: title,
          contentBody: contentBody,
          hashtags: hashtags,
          selectedPlatforms: selectedPlatforms,
          dateTime: dateTime,
          designer: needsGraphicDesigner,
          comments: requesterComments,
          attachmentURL: attachments,
          // email: userEmail,
        };

        saveItem(requestData);
        setShowAlert(true);
        // uploadFile(e, requestData.id);
        console.log(requestData);
        clearData();
      } catch (error) {
        console.log(error);
      }
    }
  };

  const clearData = () => {
    setTitle("");
    setContentBody("");
    setHashtags("");
    setSelectedPlatforms("Select platform");
    setDateTime("");
    setRequesterComments("");
    // setAttachments(null);
  };

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 3000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [showAlert]);

  // console.log(formError);

  return (
    <div className="container" style={{ paddingTop: "100px" }}>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className=" pt-4 pb-5">
            <h2 className="mb-4 text-center">Create Request</h2>
            <form onSubmit={handleSubmit} className="mb-4">
              {formError && <p className="text-danger">{formError}</p>}
              <div className="mb-3">
                <label htmlFor="titleInput1" className="form-label">
                  Title: <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  // required
                  className="form-control"
                  id="titleInput1"
                  value={title}
                  onChange={handleTitleChange}
                />
                {titleError && <p className="text-danger">{titleError}</p>}
                <p className="text-muted">{title.length}/50 characters</p>
              </div>

              <div className="mb-3">
                <label htmlFor="contentBodyInput" className="form-label">
                  Content Body: <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  id="contentBodyInput"
                  rows="3"
                  // required
                  value={contentBody}
                  onChange={handleContentBodyChange}
                ></textarea>
                {contentError && <p className="text-danger">{contentError}</p>}
                <p className="text-muted">
                  {contentBody.length}/250 characters
                </p>
              </div>

              <div className="mb-3">
                <label htmlFor="hashtagsInput1" className="form-label">
                  Hashtags: <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="hashtagsInput1"
                  // required
                  value={hashtags}
                  onChange={handleHashtagsChange}
                />
                {hashtagError && <p className="text-danger">{hashtagError}</p>}
                <p className="text-muted">{hashtags.length}/100 characters</p>
              </div>

              <div className="mb-3">
                <label htmlFor="selectPlatform" className="form-label">
                  Select Platform: <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  aria-label="Default select example"
                  // required
                  value={selectedPlatforms}
                  onChange={(e) => setSelectedPlatforms(e.target.value)}
                >
                  <option value="" disabled>
                    Select Platform...
                  </option>
                  <option value="Facebook Instagram Twitter">All</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Twitter">Twitter</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="datetimePicker" className="form-label">
                  Select Date and Time for Posting:{" "}
                  <span className="text-danger">*</span>
                </label>

                <DatePicker
                  selected={dateTime}
                  onChange={(date) => setDateTime(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="dd/MM/yyyy HH:mm"
                  minDate={new Date()}
                  className="form-control"
                  id="datetimePicker"
                  name="datetime"
                  // required
                />

                {/* <input
                  type="datetime-local"
                  className="form-control"
                  id="datetimePicker"
                  name="datetime"
                  required
                  // min={new Date().toISOString().split(".")[0]}
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                /> */}
              </div>

              <div className="mb-3">
                <label htmlFor="datetimePicker" className="form-label">
                  Need help of graphic designer:{" "}
                  <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  aria-label="Default select example"
                  // required
                  value={needsGraphicDesigner}
                  onChange={(e) => setNeedsGraphicDesigner(e.target.value)}
                >
                  <option value="" disabled>
                    Select Graphic Designer...
                  </option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="requesterComments" className="form-label">
                  Requester comments: <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  id="requesterComments"
                  rows="3"
                  // required
                  value={requesterComments}
                  onChange={handleCommentsChange}
                ></textarea>
                {commentsError && (
                  <p className="text-danger">{commentsError}</p>
                )}
                <p className="text-muted">
                  {requesterComments.length}/250 characters
                </p>
              </div>

              <div className="mb-3">
                <label htmlFor="multipleFiles" className="form-label">
                  Attachments:
                </label>
                <input
                  className="form-control mb-3"
                  type="file"
                  id="multipleFiles"
                  onChange={uploadFile}
                  multiple
                />

                {loading && (
                  <div className="text-center">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}

                {attachments.length > 0 && attachments.length <= 3 ? (
                  <>
                    <p>Uploaded {attachments.length} files successfully</p>
                    <AttachmentList
                      attachments={attachments}
                      fileNames={fileNames}
                      removeAttachment={removeAttachment}
                      removeFileName={removeFileName}
                    />
                  </>
                ) : (
                  <p>Upload only 3 files.</p>
                )}
              </div>

              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </form>
            {showAlert && (
              <div className="alert alert-success" role="alert">
                Request submitted successfully!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewRequest1;

import React, { useEffect, useState } from "react";
import { db, storage } from "../../firebase.config";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import moment from "moment";
import { MdClose } from "react-icons/md";

const Designer = () => {
  const [requests, setRequests] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [per, setPerc] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState([]);
  const [expandedContentId, setExpandedContentId] = useState(null);
  const [fileNames, setFileNames] = useState([]);

  const handleToggleContent = (docId) => {
    setExpandedContentId(docId === expandedContentId ? null : docId);
  };

  useEffect(() => {
    getRequests();
  }, []);

  const getRequests = async () => {
    try {
      const data = await getDocs(
        query(
          collection(db, "requestData"),
          // where("designer", "==", "Yes"),
          orderBy("id", "desc")
        )
      );
      console.log(data.docs);
      setRequests(
        data.docs
          .map((doc) => ({ ...doc.data(), id: doc.id }))
          .filter((request) => request.designer === "Yes")
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (id) => {
    try {
      // Update the document status to 'pending' in Firestore
      await updateDoc(doc(db, "requestData", id), {
        approverStatus: "pending",
        designAttachmentURL: attachments[id],
      });
      // alert("Design has been submitted successfully.");

      console.log(`Document with ID ${id} submitted with pending status`);
      // You can remove the document from the UI here
      setRequests(requests.filter((request) => request.id !== id));
      setShowAlert(true);
      // localStorage.setItem('removedRequestId', id);
      // const removedRequestId = localStorage.getItem('removedRequestId');
      // localStorage.removeItem('removedRequestId');
    } catch (error) {
      console.error("Error submitting document:", error);
    }
  };

  // *********************************************************************************
  const removeAttachment = (index, docId) => {
    setAttachments({
      ...attachments,
      [docId]: attachments[docId] ? attachments[docId].filter((attachment, i) => i !== index) : []
    });
    setFileNames({
      ...fileNames,
      [docId]: fileNames[docId] ? fileNames[docId].filter((fileName, i) => i !== index) : []
    });
  };

  const removeFileName = (index, docId) => {
    setFileNames({
      ...fileNames,
      [docId]: fileNames[docId] ? fileNames[docId].filter((fileName, i) => i !== index) : []
    });
    setAttachments({
      ...attachments,
      [docId]: attachments[docId] ? attachments[docId].filter((attachment, i) => i !== index) : []
    });
  };

  const uploadFile = (e, docId) => {
    setLoading((loading) => ({ ...loading, [docId]: true })); // Update loading state for specific doc ID
    const files = e.target.files;
    const uploadPromises = [];

    // Check if any file is already uploaded or not
    let existingAttachments = attachments[docId] ? [...attachments[docId]] : [];
    let existingFileNames = fileNames[docId] ? [...fileNames[docId]] : [];

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
        if (existingAttachments.length > 0) {
          setAttachments({
            ...attachments,
            [docId]: [
              ...existingAttachments,
              ...attachments.map((attachment) => attachment.url),
            ],
          });
          setFileNames({
            ...fileNames,
            [docId]: [
              ...existingFileNames,
              ...attachments.map((attachment) => attachment.name),
            ],
          });
        } else {
          setAttachments({
            ...attachments,
            [docId]: attachments.map((attachment) => attachment.url),
          });
          setFileNames({
            ...fileNames,
            [docId]: attachments.map((attachment) => attachment.name),
          });
        }
        setLoading((loading) => ({ ...loading, [docId]: false }));
      })
      .catch((error) => {
        console.log(error);
      });
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

  return (
    <div className="container" style={{ paddingTop: "150px" }}>
      <h2 className="mb-4 text-center">Graphic Designer</h2>
      {showAlert && (
        <div className="alert alert-success" role="alert">
          Design submitted successfully!
        </div>
      )}
      <table className="table table-bordered ">
        <thead>
          <tr>
            <th scope="col" className="text-center">
              No.
            </th>
            <th scope="col" className="text-center">
              Title
            </th>
            <th scope="col" className="text-center">
              Content Body
            </th>
            <th scope="col" className="text-center">
              Hashtags
            </th>
            <th scope="col" className="text-center">
              Selected Platforms
            </th>
            <th scope="col" className="text-center">
              Date Time
            </th>
            <th scope="col" className="text-center">
              Graphic Design
            </th>
            <th scope="col" className="text-center">
              Comments
            </th>
            <th scope="col" className="text-center">
              Requester's Design
            </th>
            <th scope="col" className="text-center">
              Upload Design
            </th>
            <th scope="col" className="text-center">
              Submit Design
            </th>
          </tr>
        </thead>
        <tbody>
          {requests.map((doc, index) => {
            let formattedDateTime = "";
            if (doc.dateTime && doc.dateTime.toDate) {
              // Convert Firestore datetime string to JavaScript Date object
              const dateTime = doc.dateTime.toDate();

              // Format the date using moment.js
              formattedDateTime = moment(dateTime).format("DD/MM/YYYY h:mm A");
            }
            return (
              <tr key={doc.id}>
                <td scope="row">{index + 1}</td>
                <td>{doc.title}</td>
                {/* <td className="text-wrap">{doc.contentBody}</td> */}
                <td>
                  <button
                    type="button"
                    className="btn btn-link btn-read-more"
                    onClick={() => handleToggleContent(doc.id)}
                    aria-controls={`content-${doc.id}`}
                    aria-expanded={doc.id === expandedContentId}
                    style={{ textDecoration: "none", color: "black" }}
                  >
                    {doc.id === expandedContentId ? (
                      <>
                        {doc.contentBody}{" "}
                        <span style={{ color: "#949494", fontSize: "smaller" }}>
                          Read less
                        </span>
                      </>
                    ) : (
                      <>
                        {`${doc.contentBody.slice(0, 20)}... `}
                        <span style={{ color: "#949494", fontSize: "smaller" }}>
                          Read more
                        </span>
                      </>
                    )}
                  </button>
                  {/* <Collapse in={showContent}>
                    <div id={`content-${doc.id}`}>{doc.contentBody}</div>
                  </Collapse> */}
                </td>
                <td>{doc.hashtags}</td>
                <td>{doc.selectedPlatforms}</td>
                <td>{formattedDateTime}</td>
                <td>{doc.designer}</td>
                <td>{doc.comments}</td>

                <td>
                  {doc.attachmentURL.length > 0 ? (
                    doc.attachmentURL.map((url, i) => (
                      <div key={i}>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          Asset {i + 1} - Click Here
                        </a>
                        <br />
                      </div>
                    ))
                  ) : (
                    <span>Currently no designs available.</span>
                  )}
                </td>

                <td>
                  <div>
                    
                    <input
                      type="file"
                      id={`attachments-${doc.id}`}
                      onChange={(e) => uploadFile(e, doc.id)}
                      multiple
                    />

                    {loading[doc.id] && (
                      <div className="text-center">
                        <div className="spinner-border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    )}

                    {attachments && attachments[doc.id] ? (
                      <div>
                        {attachments[doc.id].map((attachment, index) => (
                          <div key={index}>
                            <a
                              href={attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {fileNames[doc.id][index]}
                            </a>

                            <MdClose
                              className="mt-1 outline-danger"
                              onClick={() => {
                                removeAttachment(index, doc.id);
                                removeFileName(index, doc.id);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>You can upload up to 3 files.</p>
                    )}
                  </div>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleSubmit(doc.id)}
                  >
                    Submit
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Designer;

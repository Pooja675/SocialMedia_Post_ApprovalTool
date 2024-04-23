import React, { useEffect, useState } from "react";
import { db, storage } from "../../firebase.config";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
// import firebase from 'firebase/app';
import { FaCheck } from "react-icons/fa";
// import { RiCloseLine } from "react-icons/ri";
import { MdClose } from "react-icons/md";
import { getDownloadURL, ref } from "firebase/storage";
import moment from "moment";

const Approvers1 = () => {
  // const initialDesignApprovalStatus = doc.attachmentURL && doc.attachmentURL.length ? doc.attachmentURL.map(() => false) : [];
  const [requests, setRequests] = useState([]);
  const [approvalStatus, setApprovalStatus] = useState([]);
  const [designApprovalStatus, setDesignApprovalStatus] = useState({});
  const [graphicApprovalStatus, setGraphicApprovalStatus] = useState({});
  const [appComments, setAppComments] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  // const [deletedPost, setDeletedPost] = useState([]);
  // const [message, setMessage] = useState('');

  // const handleApprovalChange = (e) => {
  //   setApprovalStatus(e.target.value);
  // };

  // const handleClosePopup = () => {
  //   setSelectedImage(null);
  // };

  // ***************************************Submit the record***************************************
  const saveApprovalStatus = async (id) => {
    // Update the approval status for the specific doc id in Firestore

    try {
      const updatedDesignApprovalStatus = {}; // Create a new object to store updated attachment statuses

      const updatedGraphicApprovalStatus = {};

      // Loop through all attachments and update their status to "approved"
      for (const [key, value] of Object.entries(designApprovalStatus)) {
        if (key.startsWith(id)) {
          updatedDesignApprovalStatus[key] = "approved";
        } else {
          updatedDesignApprovalStatus[key] = value;
        }
      }

      for (const [key, value] of Object.entries(graphicApprovalStatus)) {
        if (key.startsWith(id)) {
          updatedGraphicApprovalStatus[key] = "approved";
        } else {
          updatedGraphicApprovalStatus[key] = value;
        }
      }

      await updateDoc(doc(db, "requestData", id), {
        approvalStatus: approvalStatus[id],
        appComments: appComments[id],
        designApprovalStatus: updatedDesignApprovalStatus,
        graphicApprovalStatus: updatedGraphicApprovalStatus,
      });

      // alert("Approver status has been updated.");

      console.log(`Document with ID ${id} submitted successfully.`);
      // You can remove the document from the UI here
      // setRequests((prevRequests) => prevRequests.filter((request) => request.docId !== docId));
      setDesignApprovalStatus("");

      setRequests(requests.filter((request) => request.id !== id));
      setShowAlert(true);
    } catch (error) {
      console.error("Error submitting document:", error);
    }

    // setApprovalStatus("");
  };

  useEffect(() => {
    getRequests();
  }, []);
  const getRequests = async () => {
    try {
      const data = await getDocs(
        query(collection(db, "requestData"), orderBy("id", "desc"))
      );

      console.log(data.docs);
      setRequests(
        data.docs
          .map((doc) => ({ ...doc.data(), id: doc.id }))
          .filter(
            (request) =>
              request.designer === "No" || request.approverStatus === "pending"
          )
      );
    } catch (err) {
      console.log(err);
    }
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
    <>
      {/* <pre style={{ marginTop: "300px" }}>{JSON.stringify(requests, undefined, 2)}</pre> */}
      <div className="container" style={{ paddingTop: "150px" }}>
        <h2 className="mb-4 text-center">Aprrover Status</h2>
        {showAlert && (
          <div className="alert alert-success" role="alert">
            Approver status submitted successfully!
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
                DateTime
              </th>
              <th scope="col" className="text-center">
                Graphic Design
              </th>
              <th scope="col" className="text-center">
                Requestor Comments
              </th>
              <th scope="col" className="text-center">
                Design uploaded by Requester
              </th>
              <th scope="col" className="text-center">
                Design uploaded by Graphic Designer
              </th>
              <th scope="col" className="text-center">
                Approver
              </th>
              <th scope="col" className="text-center">
                Approver Comments
              </th>
              <th scope="col" className="text-center">
                Update Status
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
                formattedDateTime =
                  moment(dateTime).format("DD/MM/YYYY h:mm A");
              }
              return (
                <tr key={doc.id}>
                  <td scope="row">{index + 1}</td>
                  <td>{doc.title}</td>
                  <td>{doc.contentBody}</td>
                  <td>{doc.hashtags}</td>
                  <td>{doc.selectedPlatforms}</td>
                  <td>{formattedDateTime}</td>
                  <td>{doc.designer}</td>
                  <td>{doc.comments}</td>

                  {/* <td>
                    {doc.attachmentURL.length > 0 ? (
                      doc.attachmentURL.map((url, i) => {
                        return (
                          <div key={i}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Asset {i + 1} - Click Here
                            </a>
                            <br />
                          </div>
                        );
                      })
                    ) : (
                      <span>Currently no designs available.</span>
                    )}
                  </td> */}

                  <td>
                    {doc.attachmentURL.length > 0 ? (
                      doc.attachmentURL.map((url, i) => {
                        const attachmentId = `${doc.id}-${i}`;
                        const isChecked =
                          designApprovalStatus[attachmentId] || false;
                        return (
                          <div key={i}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Asset {i + 1} - Click Here
                            </a>
                            <br />
                            <FaCheck
                              style={{ color: isChecked ? "green" : "black" }}
                              onClick={() => {
                                // Toggle the designApprovalStatus for the clicked attachment
                                const updatedStatus = isChecked
                                  ? null
                                  : "approved";
                                // Set the designApprovalStatus for the attachment to "approved"
                                setDesignApprovalStatus((prevState) => ({
                                  ...prevState,
                                  [attachmentId]: updatedStatus,
                                }));
                              }}
                            />
                          </div>
                        );
                      })
                    ) : (
                      <span>Currently no designs available.</span>
                    )}
                  </td>

                  <td>
                    {doc.designAttachmentURL ? (
                      doc.designAttachmentURL.map((url, i) => {
                        const attachmentId1 = `${doc.id}-${i}`;
                        const isChecked =
                          graphicApprovalStatus[attachmentId1] || false;
                        return (
                          <div key={i}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Asset {i + 1} - Click Here
                            </a>
                            <br />
                            <FaCheck
                              style={{ color: isChecked ? "green" : "black" }}
                              onClick={() => {
                                // Toggle the designApprovalStatus for the clicked attachment
                                const updatedStatus = isChecked
                                  ? null
                                  : "approved";
                                // Set the designApprovalStatus for the attachment to "approved"
                                setGraphicApprovalStatus((prevState) => ({
                                  ...prevState,
                                  [attachmentId1]: updatedStatus,
                                }));
                              }}
                            />
                          </div>
                        );
                      })
                    ) : (
                      <span>Currently no designs available.</span>
                    )}
                  </td>

                  <td>
                    <div className="radio-container">
                      <FaCheck
                        style={{
                          color:
                            approvalStatus[doc.id] === "Ready for posting"
                              ? "green"
                              : "black",
                        }}
                        // onClick={() => saveApprovalStatus(doc.id)}

                        onClick={() =>
                          setApprovalStatus((prevState) => ({
                            ...prevState,
                            [doc.id]: "Ready for posting",
                          }))
                        }
                      />

                      <MdClose
                        style={{
                          color:
                            approvalStatus[doc.id] === "design-pending"
                              ? "red"
                              : "black",
                        }}
                        // onClick={() => saveApprovalStatus(doc.id)}
                        onClick={() =>
                          setApprovalStatus((prevState) => ({
                            ...prevState,
                            [doc.id]: "design-pending",
                          }))
                        }
                      />
                    </div>
                  </td>

                  <td>
                    <textarea
                      type="text"
                      rows="5"
                      value={appComments[doc.id] || ""}
                      onChange={(e) =>
                        setAppComments((prevState) => ({
                          ...prevState,
                          [doc.id]: e.target.value,
                        }))
                      }
                    />
                  </td>

                  <td>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => saveApprovalStatus(doc.id)}
                    >
                      Submit
                    </button>
                  </td>

                  {/* <td>
                    <button
                      type="button"
                      className={Style.submitButton}
                      onClick={() => saveApprovalStatus(doc.id)}
                    >
                      Submit
                    </button>
                  </td> */}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Approvers1;

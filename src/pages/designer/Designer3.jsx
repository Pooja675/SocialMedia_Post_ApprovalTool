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
import DataTable from "react-data-table-component";
import { MdClose } from "react-icons/md";
import FilterComponent from "./FilterComponent";
// import { MdClose } from 'react-icons/md';

const Designer3 = () => {
  const [requests, setRequests] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [per, setPerc] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState([]);
  const [expandedContentId, setExpandedContentId] = useState(null);
  const [expandedCommentId, setExpandedCommentId] = useState(null);
  const [fileNames, setFileNames] = useState([]);
  const [searchText, setSearchText] = useState("");

  const handleToggleContent = (docId) => {
    setExpandedContentId(docId === expandedContentId ? null : docId);
  };
  const handleToggleComment = (docId) => {
    setExpandedCommentId(docId === expandedCommentId ? null : docId);
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
          // where("approvalStatus", "==", null),
          orderBy("id", "desc")
        )
      );
      console.log(data.docs);
      setRequests(
        data.docs
          .map((doc) => ({ ...doc.data(), id: doc.id }))
          .filter((request) => {
            return (
              request.designer === "Yes" && request.approvalStatus !== "null"
            );
          })
        // data.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (id) => {
    try {
      // Update the document status to 'pending' in Firestore
      await updateDoc(doc(db, "requestData", id), {
        approverStatus: "Pending",
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
      [docId]: attachments[docId]
        ? attachments[docId].filter((attachment, i) => i !== index)
        : [],
    });
    setFileNames({
      ...fileNames,
      [docId]: fileNames[docId]
        ? fileNames[docId].filter((fileName, i) => i !== index)
        : [],
    });
  };

  const removeFileName = (index, docId) => {
    setFileNames({
      ...fileNames,
      [docId]: fileNames[docId]
        ? fileNames[docId].filter((fileName, i) => i !== index)
        : [],
    });
    setAttachments({
      ...attachments,
      [docId]: attachments[docId]
        ? attachments[docId].filter((attachment, i) => i !== index)
        : [],
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

  const columns = [
    {
      name: "No.",
      selector: (row, index) => index + 1,
      sortable: true,
      maxwidth: "70px",
      sortFunction: (a, b) => a - b,
      cell: (row) => <div>{row.index + 1}</div>,
    },
    {
      name: "Title",
      selector: (row) => row.title,
      sortable: true,
      width: "120px",
      cell: (row) => (
        <div
          style={{ whiteSpace: "pre-wrap", fontSize: "16px", color: "black" }}
        >
          {row.title}
        </div>
      ),
    },
    {
      name: "Content Body",
      selector: (row) => row.contentBody,
      sortable: true,
      width: "280px",
      cell: (row) => (
        <div>
          <button
            type="button"
            className="btn btn-link btn-read-more"
            onClick={() => handleToggleContent(row.id)}
            aria-controls={`content-${row.id}`}
            aria-expanded={row.id === expandedContentId}
            style={{ textDecoration: "none", color: "black" }}
          >
            {row.id === expandedContentId ? (
              <>
                {row.contentBody}{" "}
                <span style={{ color: "#949494", fontSize: "12px" }}>
                  {" "}
                  <br />
                  Read less
                </span>
              </>
            ) : (
              <>
                {`${row.contentBody.slice(0, 20)}... `}
                <span style={{ color: "#949494", fontSize: "12px" }}>
                  {" "}
                  <br />
                  Read more
                </span>
              </>
            )}
          </button>
        </div>
      ),
    },
    {
      name: "Hashtags",
      selector: (row) => row.hashtags,
      sortable: true,
      width: "150px",
      cell: (row) => (
        <div
          style={{ whiteSpace: "pre-wrap", fontSize: "16px", color: "black" }}
        >
          {row.hashtags}
        </div>
      ),
    },
    {
      name: "Selected Platforms",
      selector: (row) => row.selectedPlatforms,
      sortable: true,
      width: "200px",
      cell: (row) => (
        <div
          style={{ whiteSpace: "pre-wrap", fontSize: "16px", color: "black" }}
        >
          {row.selectedPlatforms}
        </div>
      ),
    },
    {
      name: "Date Time",
      width: "180px",
      selector: (row) => {
        if (row.dateTime && row.dateTime.toDate) {
          const dateTime = row.dateTime.toDate();
          return moment(dateTime).format("DD/MM/YYYY h:mm A");
        }
        return ""; // Return empty string if dateTime is not valid
      },
      sortable: true,
    },
    {
      name: "Graphic Design",
      width: "180px",
      selector: (row) => row.designer,
      sortable: true,
    },
    {
      name: "Comments",
      selector: (row) => row.comments,
      sortable: true,
      width: "280px",
      cell: (row) => (
        <button
          type="button"
          className="btn btn-link btn-read-more"
          onClick={() => handleToggleComment(row.id)}
          aria-controls={`content-${row.id}`}
          aria-expanded={row.id === expandedCommentId}
          style={{ textDecoration: "none", color: "black" }}
        >
          {row.id === expandedCommentId ? (
            <>
              {row.comments}{" "}
              <span style={{ color: "#949494", fontSize: "12px" }}>
                {" "}
                <br />
                Read less
              </span>
            </>
          ) : (
            <>
              {`${row.comments.slice(0, 20)}... `}
              <span style={{ color: "#949494", fontSize: "12px" }}>
                {" "}
                <br />
                Read more
              </span>
            </>
          )}
        </button>
      ),
    },
    {
      name: "Requester's Design",
      width: " 180px",
      cell: (row) =>
        row.attachmentURL.length > 0 ? (
          row.attachmentURL.map((url, i) => (
            <div key={i}>
              <a href={url} target="_blank" rel="noopener noreferrer">
                Asset {i + 1} - Click Here
              </a>
              <br />
            </div>
          ))
        ) : (
          <span>Currently no designs available.</span>
        ),
    },
    {
      name: "Upload Design",
      width: "250px",
      cell: (row) => (
        <div style={{ fontSize: "16px", color: "black" }}>
          <input
            type="file"
            className="mt-2"
            id={`attachments-${row.id}`}
            onChange={(e) => uploadFile(e, row.id)}
            multiple
          />

          {loading[row.id] && (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {attachments && attachments[row.id] ? (
            <div>
              {attachments[row.id].map((attachment, index) => (
                <div key={index}>
                  <a
                    href={attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {fileNames[row.id][index]}
                  </a>

                  <MdClose
                    className="mt-1 outline-danger"
                    onClick={() => {
                      removeAttachment(index, row.id);
                      removeFileName(index, row.id);
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p>You can upload up to 3 files.</p>
          )}
        </div>
      ),
    },
    {
      name: "Submit Design",
      width: "150px",
      cell: (row) => (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => handleSubmit(row.id)}
        >
          Submit
        </button>
      ),
    },
  ];

  const customStyles = {
    headRow: {
      style: {
        minHeight: "56px", // Adjust the height of the table header row
      },
    },
    headCells: {
      style: {
        fontSize: "14px", // Adjust the font size of the table header cells
      },
    },
    input: {
      style: {
        fontSize: "14px", // Adjust the font size of the search input
        borderRadius: "4px", // Optional: Add border radius to the search input
        marginTop: "200px",
      },
    },
  };

  return (
    <>
      <div className="container" style={{ paddingTop: "150px" }}>
        <h2 className="mb-4 text-center">Graphic Designer</h2>
        <div className="text-center">
          {showAlert && (
            <div className="alert alert-success" role="alert">
              Design submitted successfully!
            </div>
          )}
        </div>
        <div style={{ overflowX: "auto" }}>
          <DataTable
            columns={columns}
            data={requests
              .map((request, index) => ({ ...request, index }))
              .filter((row) =>
                Object.values(row).some(
                  (value) =>
                    value &&
                    value
                      .toString()
                      .toLowerCase()
                      .includes(searchText.toLowerCase())
                )
              )}
            pagination
            paginationRowsPerPageOptions={[5, 10, 20]}
            paginationPerPage={5}
            // paginationServer={true}
            // customStyles={customStyles}
            responsive={true} // Enable responsive design for mobile devices
            highlightOnHover={true} // Highlight rows on hover
            striped={true}
            selectableRows
            selectableRowsHighlight
            subHeader
            subHeaderComponent={
              <FilterComponent
                onFilter={(value) => {
                  setSearchText(value);
                }}
                searchText={searchText}
              />
            }
            subHeaderAlign="right"
            subHeaderWrap={false}
            noHeader={true}
            // noDataComponent={<EmptyTable />}
          />
        </div>
      </div>
      {/* <DashboardDesigner /> */}
    </>
  );
};

export default Designer3;

import React, { useEffect, useState } from "react";
import Logo from "../../images/logo2.png";
import { Link } from "react-router-dom";
import { app, db } from "../../firebase.config";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";

const Navbar1 = () => {
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const roles = {
    requester: "requester",
    designer: "designer",
    approver: "approver",
  };

  // useEffect(() => {
  //   const user = JSON.parse(localStorage.getItem("user"));
  //   if (user) {
  //     setUser(user);
  //   }
  // }, []);

  // const login = () => {
  //   signInWithPopup(auth, provider)
  //     .then((result) => {
  //       const user = result.user;
  //       console.log(user);
  //       setUser(user);
  //       localStorage.setItem("user", JSON.stringify(user));
  //     })
  //     .catch((error) => {
  //       console.log("error:", error);
  //     });
  // };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        getUserRole(user.email); // Get the user's role when the user is logged in
      }
    });

    return () => unsubscribe();
  }, []);

  const getUserRole = async (email) => {
    try {
      const userDoc = await getDoc(doc(db, "users", email));
      if (userDoc.exists()) {
        setUserRole(userDoc.data().role); // Set the user's role in state
      }

      // console.log("User role is:", userRole );
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  const login = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        setUser(user); // Store user
        console.log(user);
        localStorage.setItem("user", JSON.stringify(user)); // Store user data in local storage
        saveUserWithEmail(user.email, user.displayName); // Save user email and role to Firestore
      })
      .catch((error) => {
        console.log("error:", error);
      });
  };

  const saveUserWithEmail = async (email, displayName) => {
    try {
      const userDoc = await getDoc(doc(db, "users", email));
      if (userDoc.exists()) {
        console.log("User already exists in Firestore");
        return;
      }
      await setDoc(doc(db, "users", email), { email, displayName });
      console.log("User saved to Firestore");
    } catch (error) {
      console.error("Error saving user email and role to Firestore:", error);
    }
  };

  const logout = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        localStorage.clear();
      })
      .catch((error) => {
        setUser(null);
      });
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary fixed-top py-3">
      <div className="container-fluid">
        <Link to={"/"} className="navbar-brand">
          <img
            src={Logo}
            alt="Logo"
            width="30"
            height="25"
            className="d-inline-block align-text-top ms-4 me-4"
          />
          <span style={{ fontWeight: "bold" }}>SMPAT</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul
            className="navbar-nav ms-auto mb-2 mb-lg-0"
            style={{ fontSize: "20px", gap: "10px" }}
          >
            {user &&
              (userRole === "requester" ||
                userRole === "approver" ||
                userRole === "designer") && (
                <li className="nav-item">
                  <Link
                    to={"/createRequest"}
                    className="nav-link "
                    aria-current="page"
                  >
                    Create new request
                  </Link>
                </li>
              )}

            {user && userRole === "designer" && (
              <>
                <li className="nav-item">
                  <Link to={"/designer"} className="nav-link">
                    Designer
                  </Link>
                </li>

                <li className="nav-item">
                  <Link to={"/designer/DashboardDesigner"} className="nav-link">
                    Dashboard
                  </Link>
                </li>
              </>
            )}

            {user && (userRole === "approver" || userRole === "requester") && (
              <>
                <li className="nav-item">
                  <Link to={"/approvers"} className="nav-link">
                    Approvers
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to={"/approvers/DashboardApprover"} className="nav-link">
                    Dashboard
                  </Link>
                </li>

              </>
            )}
          </ul>
          {user ? (
            <Link to={"/"}>
              <button
                className="btn btn-outline-success btn-lg ms-4"
                type="button"
                style={{
                  borderRadius: "8px",
                  fontSize: "18px",
                  marginRight: "20px",
                }}
                onClick={logout}
              >
                Logout
              </button>
            </Link>
          ) : (
            <button
              className="btn btn-outline-success btn-lg ms-4"
              type="button"
              style={{
                borderRadius: "8px",
                fontSize: "18px",
                marginRight: "20px",
              }}
              onClick={login}
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar1;

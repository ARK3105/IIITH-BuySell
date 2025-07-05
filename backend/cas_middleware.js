import axios from "axios";
import xml2js from "xml2js";
import { casConfig } from "./config.js";

export const validateCasTicket = async (ticket) => {
  try {
    const validateUrl = `${
      casConfig.cas_url
    }/p3/serviceValidate?service=${encodeURIComponent(
      casConfig.service_url + "/users/cas/callback"
    )}&ticket=${ticket}`;
    
    console.log("Validating ticket with URL:", validateUrl);
    const response = await axios.get(validateUrl);
    console.log("CAS Response:", response.data);

    return new Promise((resolve, reject) => {
      // Try with explicitArray: false first, then fall back to default
      xml2js.parseString(response.data, { trim: true, explicitArray: false }, (err, result) => {
        if (err) {
          console.error("XML parsing error with explicitArray:false, trying default:", err);
          // Try again with default settings
          xml2js.parseString(response.data, (err2, result2) => {
            if (err2) {
              console.error("XML parsing error with default settings:", err2);
              reject(err2);
              return;
            }
            processResult(result2, resolve, reject);
          });
          return;
        }
        processResult(result, resolve, reject);
      });
    });
  } catch (error) {
    console.error("CAS Validation error:", error);
    throw new Error(`CAS Validation failed: ${error.message}`);
  }
};

function processResult(result, resolve, reject) {
  console.log("Parsed XML result:", JSON.stringify(result, null, 2));

  const serviceResponse = result["cas:serviceResponse"];
  if (!serviceResponse) {
    console.error("No cas:serviceResponse found in response");
    console.error("Available keys in result:", Object.keys(result || {}));
    reject(new Error("Invalid CAS response format"));
    return;
  }

  if (serviceResponse["cas:authenticationSuccess"]) {
    const success = serviceResponse["cas:authenticationSuccess"];
    console.log("Authentication success:", success);
    
    // Handle both array and object formats
    const userInfo = Array.isArray(success) ? success[0] : success;
    const userEmail = Array.isArray(userInfo["cas:user"]) ? userInfo["cas:user"][0] : userInfo["cas:user"];
    
    if (!userEmail) {
      console.error("No user email found in success response");
      reject(new Error("No user email found in CAS response"));
      return;
    }
    
    const user = {
      email: userEmail,
      attributes: userInfo["cas:attributes"] || {},
    };
    console.log("Extracted user:", user);
    resolve(user);
  } else if (serviceResponse["cas:authenticationFailure"]) {
    const failure = Array.isArray(serviceResponse["cas:authenticationFailure"]) 
      ? serviceResponse["cas:authenticationFailure"][0] 
      : serviceResponse["cas:authenticationFailure"];
    console.error("CAS Authentication failure:", failure);
    reject(new Error(`CAS Authentication failed: ${failure._ || failure}`));
  } else {
    console.error("Unknown CAS response format");
    console.error("ServiceResponse content:", serviceResponse);
    reject(new Error("CAS Authentication failed - unknown response format"));
  }
}

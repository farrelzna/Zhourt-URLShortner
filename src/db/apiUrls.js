import supabase, { supabaseUrl } from "./supabase";

// ===== CONSTANTS =====
const TABLES = {
  URLS: "urls",
  STORAGE_BUCKET: "qrs",
};

const ERRORS = {
  USER_ID_REQUIRED: "User ID is required",
  UNABLE_TO_LOAD_URLS: "Unable to load URLs",
  UNABLE_TO_DELETE_URL: "Unable to delete URL",
  ERROR_CREATING_URL: "Error creating short URL",
  SHORT_URL_NOT_FOUND: "Short URL not found",
  QR_UPLOAD_FAILED: "Failed to upload QR code",
};

// ===== UTILITY FUNCTIONS =====
/**
 * Extracts user ID from object or returns the ID directly
 * @param {string|object} userId - User ID as string or user object
 * @returns {string} - Extracted user ID
 */
const extractUserId = (userId) => {
  return typeof userId === "object" ? userId?.id : userId;
};

/**
 * Generates a random short URL identifier
 * @returns {string} - Random 4-character string
 */
const generateShortUrl = () => {
  return Math.random().toString(36).substring(2, 6);
};

/**
 * Constructs QR code public URL
 * @param {string} fileName - QR code file name
 * @returns {string} - Public QR code URL
 */
const constructQrUrl = (fileName) => {
  return `${supabaseUrl}/storage/v1/object/public/${TABLES.STORAGE_BUCKET}/${fileName}`;
};

/**
 * Handles Supabase errors and throws custom error messages
 * @param {object} error - Supabase error object
 * @param {string} customMessage - Custom error message
 */
const handleSupabaseError = (error, customMessage) => {
  console.error("Supabase Error:", error);
  throw new Error(customMessage);
};

// ===== API FUNCTIONS =====

/**
 * Retrieves all URLs for a specific user
 * @param {string|object} userId - User ID or user object
 * @returns {Promise<Array>} - Array of URL records
 */
export async function getUrls(userId) {
  const actualUserId = extractUserId(userId);

  if (!actualUserId) {
    throw new Error(ERRORS.USER_ID_REQUIRED);
  }

  const { data, error } = await supabase
    .from(TABLES.URLS)
    .select("*")
    .eq("user_id", actualUserId);

  if (error) {
    handleSupabaseError(error, ERRORS.UNABLE_TO_LOAD_URLS);
  }

  return data;
}

/**
 * Deletes a URL record by ID
 * @param {string} id - URL record ID
 * @returns {Promise<Array>} - Deleted record data
 */
export async function deleteUrls(id) {
  const { data, error } = await supabase
    .from(TABLES.URLS)
    .delete()
    .eq("id", id);

  if (error) {
    handleSupabaseError(error, ERRORS.UNABLE_TO_DELETE_URL);
  }

  return data;
}

/**
 * Creates a new short URL with QR code
 * @param {object} urlData - URL creation data
 * @param {string} urlData.title - URL title
 * @param {string} urlData.longUrl - Original long URL
 * @param {string} urlData.customUrl - Custom short URL (optional)
 * @param {string} urlData.user_id - User ID
 * @param {Blob} qrcode - QR code image blob
 * @returns {Promise<Array>} - Created URL record
 */
export async function createUrls(urlData, qrcode) {
  const { title, longUrl, customUrl, user_id } = urlData;

  // Generate short URL and QR filename
  const shortUrl = generateShortUrl();
  const qrFileName = `qr-${shortUrl}`;

  try {
    // Upload QR code to storage
    const { error: storageError } = await supabase.storage
      .from(TABLES.STORAGE_BUCKET)
      .upload(qrFileName, qrcode);

    if (storageError) {
      throw new Error(`${ERRORS.QR_UPLOAD_FAILED}: ${storageError.message}`);
    }

    // Construct QR code public URL
    const qrUrl = constructQrUrl(qrFileName);

    // Insert URL record
    const { data, error } = await supabase
      .from(TABLES.URLS)
      .insert([
        {
          title,
          original_url: longUrl,
          custom_url: customUrl || null,
          user_id,
          short_url: shortUrl,
          qr: qrUrl,
        },
      ])
      .select();

    if (error) {
      handleSupabaseError(error, ERRORS.ERROR_CREATING_URL);
    }

    return data;
  } catch (error) {
    // If QR upload succeeded but URL creation failed, cleanup might be needed
    console.error("Error in createUrls:", error);
    throw error;
  }
}

/**
 * Retrieves original URL by short URL or custom URL
 * @param {string} id - Short URL or custom URL identifier
 * @returns {Promise<object|null>} - URL record with original_url or null
 */
export async function getLongUrl(id) {
  const { data: shortLinkData, error: shortLinkError } = await supabase
    .from(TABLES.URLS)
    .select("id, original_url")
    .or(`short_url.eq.${id},custom_url.eq.${id}`)
    .single();

  // Handle "not found" error gracefully (PGRST116 is Supabase's "no rows" error)
  if (shortLinkError && shortLinkError.code !== "PGRST116") {
    console.error("Error fetching short link:", shortLinkError);
    return null;
  }

  return shortLinkData;
}

/**
 * Retrieves a specific URL record by ID and user ID
 * @param {object} params - Query parameters
 * @param {string} params.id - URL record ID
 * @param {string} params.user_id - User ID
 * @returns {Promise<object>} - URL record
 */
export async function getUrl({ id, user_id }) {
  const { data, error } = await supabase
    .from(TABLES.URLS)
    .select("*")
    .eq("id", id)
    .eq("user_id", user_id)
    .single();

  if (error) {
    handleSupabaseError(error, ERRORS.SHORT_URL_NOT_FOUND);
  }

  return data;
}

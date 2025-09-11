import supabase from "./supabase"

export async function getUrls(user_id) {
  // Extract the actual user ID if user_id is an object
  const actualUserId = typeof user_id === 'object' ? user_id?.id : user_id;
  
  if (!actualUserId) {
    throw new Error("User ID is required");
  }

  let {data, error} = await supabase
    .from("urls")
    .select("*")
    .eq("user_id", actualUserId);

  if (error) {
    console.error(error);
    throw new Error("Unable to load URLs");
  }

  return data;
}

// export async function deleteUrls(id) {

// }

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function getProfile() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert([{}])
      .select()
      .single();
    if (createError) throw createError;
    return newProfile;
  }

  return data;
}

async function updateProfile(profileData) {
  const existing = await getProfile();
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...profileData, last_session: new Date().toISOString() })
    .eq('id', existing.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function saveSession(sessionData) {
  const { data, error } = await supabase
    .from('sessions')
    .insert([sessionData])
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function getSessions(limit = 20) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

module.exports = { getProfile, updateProfile, saveSession, getSessions };

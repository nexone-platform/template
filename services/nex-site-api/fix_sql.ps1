$content = Get-Content landing_page_data.sql

# Restore original public. just in case previously I messed up table quotes
# Actually, I changed 'public.' to 'nex_site.' already, so the pattern is 'nex_site.tablename'

$replacements = @{
    'nex_site.admin_users' = 'nex_site."auth-tb-ms-users"';
    'nex_site.auth_logs' = 'nex_site."auth-tb-tr-logs"';
    'nex_site.contact_submissions' = 'nex_site."adm-tb-tr-contact-submissions"';
    'nex_site.manage_jobs' = 'nex_site."adm-tb-ms-manage-jobs"';
    'nex_site.jobs' = 'nex_site."adm-tb-ms-manage-jobs"';
    'nex_site.language_translations' = 'nex_site."adm-tb-ms-language-translations"';
    'nex_site.languages' = 'nex_site."adm-tb-ms-languages"';
    'nex_site.page_view_logs' = 'nex_site."adm-tb-tr-page-view-logs"';
    'nex_site.pages' = 'nex_site."adm-tb-ms-pages"';
    'nex_site.site_settings' = 'nex_site."adm-tb-ms-site-settings"';
    'nex_site.theme_settings' = 'nex_site."adm-tb-ms-theme-settings"';
}

$newContent = $content
foreach ($key in $replacements.Keys) {
    if ($key -eq 'nex_site.jobs') {
        $newContent = $newContent -replace '\bnex_site\.jobs\b', $replacements[$key]
    } elseif ($key -eq 'nex_site.pages') {
        $newContent = $newContent -replace '\bnex_site\.pages\b', $replacements[$key]
    } else {
        $newContent = $newContent -replace $key, $replacements[$key]
    }
}

$newContent | Set-Content landing_page_data_fixed.sql

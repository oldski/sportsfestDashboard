# WordPress REST API Setup Guide

This guide will help you configure WordPress to serve PDF documents via REST API for the SportsFest dashboard recruitment tools.

## Table of Contents
1. [Basic WordPress REST API Setup](#basic-wordpress-rest-api-setup)
2. [Authentication Setup](#authentication-setup)
3. [Custom Endpoint (Recommended)](#custom-endpoint-recommended)
4. [Environment Configuration](#environment-configuration)
5. [Testing the API](#testing-the-api)
6. [Troubleshooting](#troubleshooting)

## Basic WordPress REST API Setup

### Step 1: Enable WordPress REST API
The WordPress REST API is enabled by default in WordPress 4.7+. No additional plugins are required for basic functionality.

### Step 2: Upload PDF Documents
1. Go to WordPress Admin → **Media** → **Add New**
2. Upload your recruitment PDF documents
3. Note the file URLs and titles for testing

### Step 3: Test Basic API Access
Test if your WordPress REST API is accessible:
```bash
curl https://your-wordpress-site.com/wp-json/wp/v2/media?media_type=application&mime_type=application/pdf
```

## Authentication Setup

### Option A: Application Passwords (Recommended)
Application Passwords provide secure, revocable access tokens.

1. **Enable Application Passwords:**
   - Go to WordPress Admin → **Users** → **Profile**
   - Scroll to "Application Passwords" section
   - Enter name: "SportsFest Dashboard"
   - Click "Add New Application Password"
   - **Save the generated password** (you won't see it again)

2. **Update Environment Variables:**
   ```env
   WORDPRESS_API_URL=https://your-wordpress-site.com
   WORDPRESS_API_KEY=your-generated-application-password
   ```

### Option B: JWT Authentication Plugin
For more advanced authentication, install a JWT plugin:

1. Install **JWT Authentication for WP-API** plugin
2. Add to `wp-config.php`:
   ```php
   define('JWT_AUTH_SECRET_KEY', 'your-secret-key-here');
   define('JWT_AUTH_CORS_ENABLE', true);
   ```

## Custom Endpoint (Recommended)

For better control and performance, create a custom WordPress endpoint specifically for recruitment documents.

### Step 1: Create Plugin File
Create `wp-content/plugins/sportsfest-api/sportsfest-api.php`:

```php
<?php
/**
 * Plugin Name: SportsFest API
 * Description: Custom API endpoints for SportsFest Dashboard
 * Version: 1.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class SportsFestAPI {

    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    public function register_routes() {
        register_rest_route('sportsfest/v1', '/recruitment-documents', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_recruitment_documents'),
            'permission_callback' => array($this, 'check_permissions'),
        ));
    }

    public function check_permissions($request) {
        // For public access, return true
        // For authenticated access, check user capabilities
        return true; // or current_user_can('read')
    }

    public function get_recruitment_documents($request) {
        // Query for PDF media files
        $args = array(
            'post_type' => 'attachment',
            'post_mime_type' => 'application/pdf',
            'post_status' => 'inherit',
            'numberposts' => 100,
            'meta_query' => array(
                array(
                    'key' => '_recruitment_document',
                    'value' => 'yes',
                    'compare' => '='
                )
            )
        );

        $attachments = get_posts($args);
        $documents = array();

        foreach ($attachments as $attachment) {
            $documents[] = array(
                'id' => $attachment->ID,
                'title' => $attachment->post_title,
                'url' => wp_get_attachment_url($attachment->ID),
                'fileName' => basename(get_attached_file($attachment->ID)),
                'fileSize' => filesize(get_attached_file($attachment->ID)),
                'mimeType' => $attachment->post_mime_type,
                'dateModified' => $attachment->post_modified,
            );
        }

        return rest_ensure_response(array(
            'success' => true,
            'documents' => $documents,
            'count' => count($documents)
        ));
    }
}

new SportsFestAPI();

// Add meta box for marking recruitment documents
add_action('add_meta_boxes', 'add_recruitment_document_meta_box');
add_action('edit_attachment', 'save_recruitment_document_meta');
add_action('add_attachment', 'save_recruitment_document_meta');

function add_recruitment_document_meta_box() {
    add_meta_box(
        'recruitment-document',
        'Recruitment Document',
        'recruitment_document_meta_box_callback',
        'attachment',
        'side'
    );
}

function recruitment_document_meta_box_callback($post) {
    // Add nonce for security
    wp_nonce_field('recruitment_document_nonce', 'recruitment_document_nonce');

    $value = get_post_meta($post->ID, '_recruitment_document', true);
    echo '<label>';
    echo '<input type="checkbox" name="recruitment_document" value="yes"' . checked($value, 'yes', false) . '>';
    echo ' Mark as recruitment document';
    echo '</label>';
    echo '<p class="description">Check this box to include this PDF in the SportsFest dashboard recruitment tools.</p>';
}

function save_recruitment_document_meta($post_id) {
    // Check nonce for security
    if (!isset($_POST['recruitment_document_nonce']) || !wp_verify_nonce($_POST['recruitment_document_nonce'], 'recruitment_document_nonce')) {
        return;
    }

    // Check if user has permission to edit attachments
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    // Save or delete the meta value
    if (isset($_POST['recruitment_document']) && $_POST['recruitment_document'] === 'yes') {
        update_post_meta($post_id, '_recruitment_document', 'yes');
    } else {
        delete_post_meta($post_id, '_recruitment_document');
    }
}

// Alternative approach: Add field to attachment fields (more reliable)
add_filter('attachment_fields_to_edit', 'add_recruitment_document_field', 10, 2);
add_filter('attachment_fields_to_save', 'save_recruitment_document_field', 10, 2);

function add_recruitment_document_field($form_fields, $post) {
    $value = get_post_meta($post->ID, '_recruitment_document', true);

    $form_fields['recruitment_document'] = array(
        'label' => 'Recruitment Document',
        'input' => 'html',
        'html' => '<label><input type="checkbox" name="attachments[' . $post->ID . '][recruitment_document]" value="yes"' . checked($value, 'yes', false) . '> Mark as recruitment document</label>
                   <p class="description">Check this box to include this PDF in the SportsFest dashboard recruitment tools.</p>',
        'value' => $value,
    );

    return $form_fields;
}

function save_recruitment_document_field($post, $attachment) {
    if (isset($attachment['recruitment_document']) && $attachment['recruitment_document'] === 'yes') {
        update_post_meta($post['ID'], '_recruitment_document', 'yes');
    } else {
        delete_post_meta($post['ID'], '_recruitment_document');
    }

    return $post;
}
?>
```

### Step 2: Activate Plugin
1. Go to WordPress Admin → **Plugins**
2. Find "SportsFest API" and click **Activate**

### Step 3: Mark Documents as Recruitment Documents
1. Go to **Media Library**
2. Edit each PDF you want to show in the dashboard
3. Check "Mark as recruitment document" in the right sidebar
4. Update the file

### Step 4: Update Code to Use Custom Endpoint
Update your dashboard to use the custom endpoint by modifying the API call in `get-recruitment-documents.ts`:

```typescript
// Use the custom endpoint instead of the default WordPress media endpoint
return await getCustomRecruitmentDocuments();
```

## Environment Configuration

Update your `.env` file with your WordPress site details:

```env
# WordPress REST API Configuration
WORDPRESS_API_URL=https://your-wordpress-site.com
WORDPRESS_API_KEY=your-application-password-or-jwt-token
```

### For Development/Testing:
```env
WORDPRESS_API_URL=http://localhost/wordpress
WORDPRESS_API_KEY=
```

## Testing the API

### Test Default Endpoint:
```bash
curl "https://your-wordpress-site.com/wp-json/wp/v2/media?media_type=application&mime_type=application/pdf&per_page=10"
```

### Test Custom Endpoint:
```bash
curl "https://your-wordpress-site.com/wp-json/sportsfest/v1/recruitment-documents"
```

### Test with Authentication:
```bash
curl -H "Authorization: Bearer your-application-password" \
     "https://your-wordpress-site.com/wp-json/wp/v2/media?media_type=application&mime_type=application/pdf"
```

## Security Considerations

### 1. CORS Configuration
If you encounter CORS issues, add this to your WordPress theme's `functions.php`:

```php
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: https://your-dashboard-domain.com');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        return $value;
    });
});
```

### 2. Rate Limiting
Consider installing a rate limiting plugin like "WP REST API Rate Limit" to prevent abuse.

### 3. Authentication
Always use Application Passwords or JWT tokens for production environments.

## Troubleshooting

### Common Issues:

1. **Recruitment Document Checkbox Not Saving**
   - **Solution 1**: Replace your plugin code with the updated version above that uses `edit_attachment` hook instead of `save_post`
   - **Solution 2**: Use the alternative attachment fields approach (more reliable)
   - **Solution 3**: Check if you have sufficient permissions to edit attachments
   - **Debug**: Add this to wp-config.php to see PHP errors: `define('WP_DEBUG', true);`
   - **Test**: Try using the attachment fields method which appears directly in the media edit form

2. **404 Error on API Calls**
   - Check if WordPress REST API is enabled
   - Verify the URL format: `https://domain.com/wp-json/wp/v2/`
   - Check permalink settings in WordPress Admin

2. **Empty Response**
   - Verify PDF files are uploaded to Media Library
   - Check if files have correct MIME type (`application/pdf`)
   - For custom endpoint, ensure documents are marked as recruitment documents

3. **Authentication Errors**
   - Verify Application Password is correctly generated
   - Check if the password is being sent in the Authorization header
   - Ensure the WordPress user has appropriate permissions

4. **CORS Errors**
   - Add CORS headers (see Security Considerations)
   - Check browser developer tools for specific CORS error messages

### Debug Mode:
Add this to your WordPress `wp-config.php` for debugging:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

## Advanced Configuration

### Custom Fields for Document Metadata:
You can extend the custom endpoint to include additional metadata:

```php
// Add to the documents array in the custom endpoint:
'category' => get_post_meta($attachment->ID, '_document_category', true),
'description' => $attachment->post_content,
'featured' => get_post_meta($attachment->ID, '_featured_document', true) === 'yes',
```

### Caching:
Consider implementing WordPress object caching for better performance:

```php
// In your custom endpoint:
$cache_key = 'sportsfest_recruitment_docs';
$documents = wp_cache_get($cache_key);

if (false === $documents) {
    // Your existing query logic here
    wp_cache_set($cache_key, $documents, '', 300); // Cache for 5 minutes
}
```

---

## Next Steps

1. Set up your WordPress site with the REST API
2. Upload your recruitment PDF documents
3. Configure authentication (Application Passwords recommended)
4. Update your environment variables
5. Test the API endpoints
6. (Optional) Implement the custom endpoint for better control

The SportsFest dashboard will automatically fetch and display your PDF documents once the WordPress API is properly configured!
<?php
/**
 * Pimcore
 *
 * LICENSE
 *
 * This source file is subject to the new BSD license that is bundled
 * with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://www.pimcore.org/license
 *
 * @category   Pimcore
 * @package    Tool
 * @copyright  Copyright (c) 2009-2013 pimcore GmbH (http://www.pimcore.org)
 * @license    http://www.pimcore.org/license     New BSD License
 */

class Tool_Targeting_Persona_Resource extends Pimcore_Model_Resource_Abstract {

    /**
     * Contains all valid columns in the database table
     *
     * @var array
     */
    protected $validColumns = array();

    /**
     * Get the valid columns from the database
     *
     * @return void
     */
    public function init() {
        $this->validColumns = $this->getValidTableColumns("targeting_personas");
    }

    /**
     * Get the data for the object from database for the given id
     *
     * @param integer $id
     * @return void
     */
    public function getById($id = null) {

        if ($id != null) {
            $this->model->setId($id);
        }

        $data = $this->db->fetchRow("SELECT * FROM targeting_personas WHERE id = ?", $this->model->getId());

        if($data["id"]) {
            $data["conditions"] = Pimcore_Tool_Serialize::unserialize($data["conditions"]);
            $data["actions"] = Pimcore_Tool_Serialize::unserialize($data["actions"]);
            $this->assignVariablesToModel($data);
        } else {
            throw new Exception("persona with id " . $this->model->getId() . " doesn't exist");
        }
    }

    /**
     * Save object to database
     *
     * @return void
     */
    public function save() {
        if ($this->model->getId()) {
            return $this->model->update();
        }
        return $this->create();
    }

    /**
     * Deletes object from database
     *
     * @return void
     */
    public function delete() {
        $this->db->delete("targeting_personas", $this->db->quoteInto("id = ?", $this->model->getId()));
    }

    /**
     * Save changes to database, it's an good idea to use save() instead
     *
     * @return void
     */
    public function update() {

        try {
            $type = get_object_vars($this->model);

            foreach ($type as $key => $value) {
                if (in_array($key, $this->validColumns)) {
                    if(is_array($value) || is_object($value)) {
                        $value = Pimcore_Tool_Serialize::serialize($value);
                    }
                    if(is_bool($value)) {
                        $value = (int) $value;
                    }
                    $data[$key] = $value;
                }
            }

            $this->db->update("targeting_personas", $data, $this->db->quoteInto("id = ?", $this->model->getId()));
        }
        catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * Create a new record for the object in database
     *
     * @return boolean
     */
    public function create() {
        $this->db->insert("targeting_personas", array());

        $this->model->setId($this->db->lastInsertId());

        return $this->save();
    }
}
